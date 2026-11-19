/**
 * OpenRouter Multi-Key Pool & Round-Robin Rotation Manager
 * ----------------------------------------------------------------------------
 * ระบบจัดการ API Key แบบ Pool สำหรับ OpenRouter
 * - กระจายคำขอแบบ Round-Robin Rotation เพื่อขยาย RPM เป็นเท่าตัว (Linear Scaling)
 * - มีระบบ Failover สลับคีย์ทันทีเมื่อคีย์ใดคีย์หนึ่งชน Rate Limit (HTTP 429)
 * - ระบบ Cooldown พักคีย์ชั่วคราว (ค่าเริ่มต้น 60 วินาที) ก่อนนำกลับเข้าคิว
 * - รองรับการป้อนหลายคีย์คั่นด้วย Comma (,), Newline (\n), Semicolon (;)
 */

export interface KeyPoolItemStatus {
  key: string;
  maskedKey: string;
  index: number;
  inCooldown: boolean;
  cooldownRemainingSeconds: number;
  lastRateLimitedAt?: number;
  lastSuccessAt?: number;
  totalSuccesses: number;
  totalRateLimits: number;
}

export interface KeyTestResult {
  key: string;
  maskedKey: string;
  index: number;
  success: boolean;
  message: string;
  latencyMs: number;
}

/**
 * ลอกเครื่องหมายคำพูด คำนำหน้า Bearer และช่องว่างที่ไม่จำเป็นออกจาก API Key
 */
export function sanitizeSingleKey(raw?: string | null): string {
  if (!raw || typeof raw !== 'string') return '';
  let key = raw.trim().replace(/^["']|["']$/g, '').trim();
  if (key.toLowerCase().startsWith('bearer ')) {
    key = key.slice(7).trim();
  }
  return key;
}

/**
 * ซ่อนส่วนตรงกลางของ API Key เพื่อความปลอดภัยในการแสดงผล UI & Log
 * เช่น sk-or-v1-7a8b...9c2d
 */
export function maskApiKey(key?: string | null): string {
  if (!key) return '';
  const clean = sanitizeSingleKey(key);
  if (clean.length <= 14) {
    return clean.slice(0, 4) + '...';
  }
  return `${clean.slice(0, 10)}...${clean.slice(-4)}`;
}

/**
 * แยกสตริงที่ผู้ใช้ป้อนเข้ามา (รองรับ Comma, Newline, Semicolon, ช่องว่าง)
 * ออกเป็น Array ของ API Key ที่ผ่านการ Clean และกำจัดตัวซ้ำแล้ว
 */
export function parseApiKeyPool(raw?: string | string[] | null): string[] {
  if (!raw) return [];

  let rawList: string[] = [];
  if (Array.isArray(raw)) {
    rawList = raw;
  } else if (typeof raw === 'string') {
    // แยกด้วย comma, newline, carriage return, semicolon
    rawList = raw.split(/[\r\n,;]+/);
  }

  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of rawList) {
    const clean = sanitizeSingleKey(item);
    if (clean.length > 0 && !seen.has(clean)) {
      seen.add(clean);
      result.push(clean);
    }
  }

  return result;
}

/**
 * คลาสบริหารจัดการ Pool ของ OpenRouter API Key
 */
export class OpenRouterKeyPoolManager {
  private keys: string[] = [];
  private currentIndex = 0;
  private cooldownMap = new Map<
    string,
    {
      cooldownUntil: number;
      rateLimitCount: number;
      successCount: number;
      lastSuccessAt?: number;
      lastRateLimitedAt?: number;
    }
  >();

  constructor(initialKeys?: string | string[]) {
    if (initialKeys) {
      this.setKeys(initialKeys);
    }
  }

  /**
   * อัปเดตรายการคีย์ใน Pool
   */
  public setKeys(raw: string | string[]): void {
    const parsed = parseApiKeyPool(raw);
    this.keys = parsed;
    // ปรับ currentIndex ให้อยู่ในช่วงเสมอ
    if (this.keys.length > 0) {
      this.currentIndex = this.currentIndex % this.keys.length;
    } else {
      this.currentIndex = 0;
    }
  }

  /**
   * ดึงรายการคีย์ทั้งหมดที่อยู่ใน Pool
   */
  public getKeys(): string[] {
    return [...this.keys];
  }

  /**
   * ตรวจสอบจำนวนคีย์ใน Pool
   */
  public getKeyCount(): number {
    return this.keys.length;
  }

  /**
   * ตรวจสอบว่าคีย์นี้กำลังอยู่ในสถานะ Cooldown หรือไม่
   */
  public isKeyInCooldown(key: string): boolean {
    const clean = sanitizeSingleKey(key);
    const info = this.cooldownMap.get(clean);
    if (!info) return false;
    return Date.now() < info.cooldownUntil;
  }

  /**
   * คำนวณเวลา Cooldown ที่เหลืออยู่ของคีย์ (วินาที)
   */
  public getCooldownRemainingSeconds(key: string): number {
    const clean = sanitizeSingleKey(key);
    const info = this.cooldownMap.get(clean);
    if (!info) return 0;
    const remaining = Math.max(0, info.cooldownUntil - Date.now());
    return Math.ceil(remaining / 1000);
  }

  /**
   * เลือกคีย์ถัดไปด้วย Round-Robin
   * - ให้ความสำคัญกับคีย์ที่ไม่อยู่ใน Cooldown ก่อนเสมอ
   * - สามารถระบุ excludeKeys (เช่น คีย์ที่เพิ่งเกิด error ในรอบเดียวกัน)
   */
  public getNextKey(excludeKeys: string[] = []): {
    key: string;
    index: number;
    total: number;
    isCooldownFallback: boolean;
  } {
    if (this.keys.length === 0) {
      return { key: '', index: -1, total: 0, isCooldownFallback: false };
    }

    const cleanExcludes = new Set(excludeKeys.map(sanitizeSingleKey));
    const now = Date.now();

    // 1. ค้นหาคีย์ที่ไม่อยู่ใน Cooldown และไม่อยู่ใน excludeKeys
    const readyIndices: number[] = [];
    for (let i = 0; i < this.keys.length; i++) {
      const k = this.keys[i];
      if (cleanExcludes.has(k)) continue;
      const cInfo = this.cooldownMap.get(k);
      if (!cInfo || now >= cInfo.cooldownUntil) {
        readyIndices.push(i);
      }
    }

    // หากพบคีย์ที่พร้อมใช้งาน ให้เลือกแบบ Round-Robin
    if (readyIndices.length > 0) {
      // หาคีย์ใน readyIndices ที่ >= currentIndex
      const nextIdx =
        readyIndices.find((idx) => idx >= this.currentIndex) ?? readyIndices[0];
      this.currentIndex = (nextIdx + 1) % this.keys.length;
      return {
        key: this.keys[nextIdx],
        index: nextIdx,
        total: this.keys.length,
        isCooldownFallback: false
      };
    }

    // 2. ถ้าทุกคีย์พร้อมโดน exclude ให้ลองเอาคีย์ที่ไม่อยู่ใน Cooldown โดยไม่สน excludeKeys
    for (let i = 0; i < this.keys.length; i++) {
      const k = this.keys[i];
      const cInfo = this.cooldownMap.get(k);
      if (!cInfo || now >= cInfo.cooldownUntil) {
        this.currentIndex = (i + 1) % this.keys.length;
        return {
          key: k,
          index: i,
          total: this.keys.length,
          isCooldownFallback: false
        };
      }
    }

    // 3. Fallback: ถ้าทุกคีย์ติด Cooldown ทั้งหมด ให้เลือกคีย์ที่ Cooldown จะหมดเร็วที่สุด
    let bestIdx = 0;
    let earliestUntil = Infinity;
    for (let i = 0; i < this.keys.length; i++) {
      const k = this.keys[i];
      const cInfo = this.cooldownMap.get(k);
      const until = cInfo?.cooldownUntil || 0;
      if (until < earliestUntil) {
        earliestUntil = until;
        bestIdx = i;
      }
    }

    this.currentIndex = (bestIdx + 1) % this.keys.length;
    return {
      key: this.keys[bestIdx],
      index: bestIdx,
      total: this.keys.length,
      isCooldownFallback: true
    };
  }

  /**
   * บันทึกสถานะว่าคีย์ติด Rate Limit (HTTP 429) พักคีย์ไว้ชั่วคราว
   * ค่าเริ่มต้น Cooldown คือ 60,000ms (1 นาที)
   */
  public markRateLimited(key: string, cooldownDurationMs = 60000): void {
    const clean = sanitizeSingleKey(key);
    if (!clean) return;

    const now = Date.now();
    const existing = this.cooldownMap.get(clean) || {
      cooldownUntil: 0,
      rateLimitCount: 0,
      successCount: 0
    };

    existing.cooldownUntil = now + cooldownDurationMs;
    existing.rateLimitCount += 1;
    existing.lastRateLimitedAt = now;
    this.cooldownMap.set(clean, existing);

    console.warn(
      `[KeyPool Manager] ⚠️ Key [${maskApiKey(clean)}] hit Rate Limit (HTTP 429). Put in cooldown for ${Math.round(
        cooldownDurationMs / 1000
      )}s (Rate limited ${existing.rateLimitCount} times)`
    );
  }

  /**
   * บันทึกสถานะเมื่อการเรียก API ด้วยคีย์นี้สำเร็จ
   */
  public markSuccess(key: string): void {
    const clean = sanitizeSingleKey(key);
    if (!clean) return;

    const existing = this.cooldownMap.get(clean) || {
      cooldownUntil: 0,
      rateLimitCount: 0,
      successCount: 0
    };

    existing.successCount += 1;
    existing.lastSuccessAt = Date.now();
    this.cooldownMap.set(clean, existing);
  }

  /**
   * ล้างสถานะ Cooldown ของทุกคีย์ (Reset)
   */
  public resetCooldowns(): void {
    this.cooldownMap.clear();
  }

  /**
   * ดึงรายการสถานะสุขภาพของทุกคีย์สำหรับแสดงผลใน UI
   */
  public getStatusList(): KeyPoolItemStatus[] {
    const now = Date.now();
    return this.keys.map((k, idx) => {
      const cInfo = this.cooldownMap.get(k);
      const inCooldown = Boolean(cInfo && now < cInfo.cooldownUntil);
      const remaining = cInfo && inCooldown ? Math.max(0, cInfo.cooldownUntil - now) : 0;
      return {
        key: k,
        maskedKey: maskApiKey(k),
        index: idx,
        inCooldown,
        cooldownRemainingSeconds: Math.ceil(remaining / 1000),
        lastRateLimitedAt: cInfo?.lastRateLimitedAt,
        lastSuccessAt: cInfo?.lastSuccessAt,
        totalSuccesses: cInfo?.successCount || 0,
        totalRateLimits: cInfo?.rateLimitCount || 0
      };
    });
  }

  /**
   * ทดสอบการเชื่อมต่อ API ของคีย์เดี่ยว (Ping Test)
   */
  public async testSingleKey(
    key: string,
    model = 'openai/gpt-4o-mini',
    timeoutMs = 12000
  ): Promise<{ success: boolean; message: string; latencyMs: number }> {
    const clean = sanitizeSingleKey(key);
    if (!clean) {
      return { success: false, message: 'API Key ว่างเปล่า', latencyMs: 0 };
    }

    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${clean}`,
          'HTTP-Referer':
            typeof window !== 'undefined'
              ? window.location.origin
              : 'http://localhost:5173',
          'X-Title': 'Moral Center Key Pool Diagnostic',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 1
        })
      });

      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;

      if (res.ok) {
        this.markSuccess(clean);
        return {
          success: true,
          message: `เชื่อมต่อสำเร็จ (${latencyMs}ms)`,
          latencyMs
        };
      }

      if (res.status === 429) {
        this.markRateLimited(clean, 60000);
        return {
          success: false,
          message: 'HTTP 429: ติด Rate Limit (โควตาเต็มชั่วคราว)',
          latencyMs
        };
      }

      const errText = await res.text().catch(() => '');
      let errMsg = `HTTP ${res.status}`;
      try {
        const j = JSON.parse(errText);
        errMsg = j.error?.message || errText;
      } catch {
        errMsg = errText || `HTTP ${res.status} ${res.statusText}`;
      }

      return {
        success: false,
        message: errMsg,
        latencyMs
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;
      const isTimeout =
        err?.name === 'AbortError' || /timeout/i.test(err?.message || '');
      return {
        success: false,
        message: isTimeout
          ? `Timeout (${timeoutMs}ms)`
          : `ข้อผิดพลาด: ${err?.message || 'ขัดข้อง'}`,
        latencyMs
      };
    }
  }

  /**
   * ทดสอบทุกคีย์ใน Pool พร้อมกันแบบ Parallel
   */
  public async testAllKeys(
    customKeys?: string[],
    model = 'openai/gpt-4o-mini'
  ): Promise<KeyTestResult[]> {
    const targetKeys = customKeys && customKeys.length > 0 ? customKeys : this.keys;
    if (targetKeys.length === 0) return [];

    const promises = targetKeys.map(async (k, idx) => {
      const res = await this.testSingleKey(k, model);
      return {
        key: k,
        maskedKey: maskApiKey(k),
        index: idx,
        success: res.success,
        message: res.message,
        latencyMs: res.latencyMs
      };
    });

    return Promise.all(promises);
  }
}

/**
 * Global Singleton Instance ของ Key Pool Manager
 */
export const openRouterKeyPoolManager = new OpenRouterKeyPoolManager();
