import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import pg from 'pg';
const { Pool } = pg;

const PORT = Number(process.env.PORT || 3000);
const cwd = process.cwd();
const distDir = path.resolve(cwd, 'dist');
const dataDir = path.resolve(cwd, 'data');
const recordsDir = path.resolve(dataDir, 'pilot_records');
const taskRecordsDir = path.resolve(dataDir, 'task_records');
const aiConfigFile = path.resolve(dataDir, 'ai_config.json');
const coffeeGroupsFile = path.resolve(dataDir, 'coffee_groups.json');
const dbPath = path.resolve(dataDir, 'pilot_activities_4regions.sqlite');

// Auto-seed data directory from data_seed if running in container with fresh volume
const seedDir = path.resolve(cwd, 'data_seed');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (fs.existsSync(seedDir)) {
  if (!fs.existsSync(dbPath) && fs.existsSync(path.resolve(seedDir, 'pilot_activities_4regions.sqlite'))) {
    console.log('[Init] Seeding SQLite database from data_seed...');
    fs.copyFileSync(path.resolve(seedDir, 'pilot_activities_4regions.sqlite'), dbPath);
  }
  if (!fs.existsSync(aiConfigFile) && fs.existsSync(path.resolve(seedDir, 'ai_config.json'))) {
    console.log('[Init] Seeding ai_config.json from data_seed...');
    fs.copyFileSync(path.resolve(seedDir, 'ai_config.json'), aiConfigFile);
  }
  if (!fs.existsSync(coffeeGroupsFile) && fs.existsSync(path.resolve(seedDir, 'coffee_groups.json'))) {
    console.log('[Init] Seeding coffee_groups.json from data_seed...');
    fs.copyFileSync(path.resolve(seedDir, 'coffee_groups.json'), coffeeGroupsFile);
  }
  const seedRecords = path.resolve(seedDir, 'pilot_records');
  if (!fs.existsSync(recordsDir) && fs.existsSync(seedRecords)) {
    fs.cpSync(seedRecords, recordsDir, { recursive: true });
  }
  const seedTasks = path.resolve(seedDir, 'task_records');
  if (!fs.existsSync(taskRecordsDir) && fs.existsSync(seedTasks)) {
    fs.cpSync(seedTasks, taskRecordsDir, { recursive: true });
  }
}

if (!fs.existsSync(recordsDir)) {
  fs.mkdirSync(recordsDir, { recursive: true });
}
if (!fs.existsSync(taskRecordsDir)) {
  fs.mkdirSync(taskRecordsDir, { recursive: true });
}

const CANONICAL_PROJECT_IDS = [
  'proj-1',
  'proj-2',
  'proj-3',
  'proj-4',
  'proj-5',
  'proj-6',
  'proj-7',
  'proj-8',
  'PRJ-2026-001'
];


// Universal Database Layer supporting both PostgreSQL and SQLite
class UniversalDb {
  constructor(pgPool, sqliteDb, dbName = 'DB-MDC') {
    this.pgPool = pgPool;
    this.sqliteDb = sqliteDb;
    this.isPg = Boolean(pgPool);
    this.dbName = dbName;
    this.type = this.isPg ? 'postgres' : 'sqlite';
  }

  toPgSql(sql) {
    let transformed = sql;
    // Transform INSERT OR REPLACE INTO table (cols) VALUES (vals)
    const match = sql.match(/INSERT\s+OR\s+REPLACE\s+INTO\s+([a-zA-Z0-9_]+)\s*\(([\s\S]*?)\)\s*VALUES\s*\(([\s\S]*?)\)/i);
    if (match) {
      const table = match[1];
      const cols = match[2].split(',').map(c => c.trim());
      const pkMap = { pilot_criteria_selected_virtues: 'province', pilot_coffee_groups: 'key' };
      const pk = pkMap[table] || 'id';
      const updateCols = cols
        .filter(c => c.toLowerCase() !== pk && c.toLowerCase() !== 'created_at')
        .map(c => `${c} = EXCLUDED.${c}`)
        .join(', ');
      transformed = `INSERT INTO ${table} (${match[2]}) VALUES (${match[3]}) ON CONFLICT (${pk}) DO UPDATE SET ${updateCols}`;
    }
    let paramIdx = 0;
    return transformed.replace(/\?/g, () => `$${++paramIdx}`);
  }

  normalizeParams(params) {
    if (params.length === 1 && Array.isArray(params[0])) {
      return params[0];
    }
    return params;
  }

  async exec(sql) {
    if (this.isPg) {
      return await this.pgPool.query(sql);
    }
    return this.sqliteDb.exec(sql);
  }

  async all(sql, ...params) {
    const norm = this.normalizeParams(params);
    if (this.isPg) {
      const res = await this.pgPool.query(this.toPgSql(sql), norm);
      return res.rows;
    }
    return this.sqliteDb.prepare(sql).all(...norm);
  }

  async get(sql, ...params) {
    const norm = this.normalizeParams(params);
    if (this.isPg) {
      const res = await this.pgPool.query(this.toPgSql(sql), norm);
      return res.rows[0] || null;
    }
    return this.sqliteDb.prepare(sql).get(...norm) || null;
  }

  async run(sql, ...params) {
    const norm = this.normalizeParams(params);
    if (this.isPg) {
      const res = await this.pgPool.query(this.toPgSql(sql), norm);
      return { changes: res.rowCount, rowCount: res.rowCount };
    }
    const info = this.sqliteDb.prepare(sql).run(...norm);
    return { changes: Number(info.changes || 0), rowCount: Number(info.changes || 0) };
  }

  prepare(sql) {
    return {
      all: async (...params) => this.all(sql, ...params),
      get: async (...params) => this.get(sql, ...params),
      run: async (...params) => this.run(sql, ...params)
    };
  }
}

const PG_SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS pilot_agency_registrations (
    id TEXT PRIMARY KEY,
    province TEXT NOT NULL,
    region TEXT NOT NULL,
    agency_name TEXT NOT NULL,
    agency_type TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    position TEXT,
    participant_level TEXT,
    coordinator_name TEXT,
    participant_role TEXT,
    district TEXT,
    subdistrict TEXT,
    phone TEXT,
    email TEXT,
    contact_info TEXT,
    coffee_group TEXT,
    trial_project_name TEXT,
    trial_project_summary TEXT,
    activity_date TEXT NOT NULL,
    synergy_topic TEXT,
    uploaded_files_json TEXT,
    extracted_data_preview TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS pilot_lessons_and_policies (
    id TEXT PRIMARY KEY,
    province TEXT NOT NULL,
    region TEXT NOT NULL,
    activity_date TEXT NOT NULL,
    selected_project_ids_json TEXT,
    selected_project_names_json TEXT,
    summary_file_name TEXT,
    raw_activity_summary TEXT,
    lesson_learned_text TEXT NOT NULL,
    lesson_structured_json TEXT,
    policy_prompt TEXT,
    generated_policy_text TEXT,
    policy_structured_json TEXT,
    saved_file_path TEXT,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS pilot_hackathon_criteria (
    id TEXT PRIMARY KEY,
    province TEXT NOT NULL DEFAULT 'ส่วนกลาง',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    source_files_json TEXT,
    ai_agent_skill_text TEXT,
    rubric_json TEXT,
    prompt_skill TEXT,
    prompt_rubric TEXT,
    is_active INTEGER DEFAULT 1
  );
  CREATE INDEX IF NOT EXISTS idx_hackathon_criteria_prov ON pilot_hackathon_criteria (province);
  CREATE INDEX IF NOT EXISTS idx_hackathon_criteria_active ON pilot_hackathon_criteria (is_active);

  CREATE TABLE IF NOT EXISTS pilot_criteria_selected_virtues (
    province TEXT PRIMARY KEY,
    selected_virtues_json TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS pilot_hackathon_projects (
    id TEXT PRIMARY KEY,
    province TEXT NOT NULL,
    group_key TEXT NOT NULL,
    group_name TEXT NOT NULL,
    project_name TEXT NOT NULL,
    target_moral_virtue TEXT,
    target_audience TEXT,
    target_area TEXT,
    proposal_details TEXT,
    activity_plan TEXT,
    behavioral_kpi TEXT,
    proposer_name TEXT,
    proposer_agency TEXT,
    proposer_position TEXT,
    proposer_level TEXT,
    challenge_topic TEXT,
    evaluated_criteria_virtues_json TEXT,
    ai_score REAL NOT NULL,
    ai_score_breakdown_json TEXT,
    ai_recommendations TEXT,
    community_votes INTEGER DEFAULT 0,
    is_precheck INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_hackathon_proj_prov ON pilot_hackathon_projects (province);
  CREATE INDEX IF NOT EXISTS idx_hackathon_proj_score ON pilot_hackathon_projects (ai_score);

  CREATE TABLE IF NOT EXISTS task_project (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    project_name TEXT NOT NULL,
    province TEXT NOT NULL DEFAULT 'ส่วนกลาง',
    organization TEXT,
    phase_no INTEGER DEFAULT 1,
    phase_name TEXT NOT NULL,
    task_code TEXT NOT NULL,
    task_name TEXT NOT NULL,
    task_description TEXT,
    deliverable TEXT,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    duration_days INTEGER DEFAULT 1,
    status TEXT DEFAULT 'รอเริ่ม',
    progress_percent INTEGER DEFAULT 0,
    responsible_person TEXT,
    dependencies TEXT,
    notes TEXT,
    last_meeting_id TEXT,
    last_meeting_notes TEXT,
    updated_by_meeting_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_task_project_proj ON task_project (project_id);
  CREATE INDEX IF NOT EXISTS idx_task_project_status ON task_project (status);

  CREATE TABLE IF NOT EXISTS pms_strategic_plans (
    id TEXT PRIMARY KEY,
    fiscal_year INTEGER NOT NULL,
    five_year_plan_code TEXT,
    strategy_name TEXT NOT NULL,
    expected_outcome TEXT,
    status TEXT DEFAULT 'อนุมัติแล้ว',
    version INTEGER DEFAULT 1,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS pms_projects (
    id TEXT PRIMARY KEY,
    strategy_id TEXT,
    project_name TEXT NOT NULL,
    province TEXT NOT NULL,
    region TEXT NOT NULL,
    data_owner_org TEXT NOT NULL,
    coordinator_name TEXT,
    budget_allocated REAL DEFAULT 0,
    budget_spent REAL DEFAULT 0,
    budget_source TEXT,
    budget_cut_off_date TEXT,
    project_state TEXT DEFAULT 'เริ่มต้น',
    overall_progress INTEGER DEFAULT 0,
    start_date TEXT,
    end_date TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS pms_kpi_registry (
    id TEXT PRIMARY KEY,
    project_id TEXT,
    kpi_code TEXT NOT NULL,
    kpi_name TEXT NOT NULL,
    definition TEXT NOT NULL,
    formula TEXT,
    unit TEXT NOT NULL,
    direction TEXT DEFAULT 'HIGHER_BETTER',
    baseline_value REAL DEFAULT 0,
    target_value REAL NOT NULL,
    actual_value REAL DEFAULT 0,
    score REAL DEFAULT 0,
    frequency TEXT DEFAULT 'รายไตรมาส',
    data_source TEXT,
    data_owner TEXT NOT NULL,
    verification_status TEXT DEFAULT 'รอตรวจสอบ',
    reviewer_name TEXT,
    reviewed_at TEXT,
    approver_name TEXT,
    approved_at TEXT,
    rejection_reason TEXT,
    evidence_file_name TEXT,
    ai_confidence_score REAL
  );

  CREATE TABLE IF NOT EXISTS pms_decision_actions (
    id TEXT PRIMARY KEY,
    project_id TEXT,
    project_name TEXT,
    kpi_id TEXT,
    issue_topic TEXT NOT NULL,
    directive_text TEXT NOT NULL,
    reason TEXT,
    responsible_person TEXT NOT NULL,
    due_date TEXT NOT NULL,
    status TEXT DEFAULT 'ระหว่างดำเนินการ',
    follow_up_result TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS pms_meeting_reports (
    id TEXT PRIMARY KEY,
    meeting_id TEXT NOT NULL,
    project_id TEXT NOT NULL,
    project_name TEXT NOT NULL,
    province TEXT NOT NULL,
    meeting_date TEXT NOT NULL,
    meeting_topic TEXT NOT NULL,
    reporting_period TEXT,
    executive_summary TEXT,
    source_file_name TEXT,
    obstacles_and_risks TEXT,
    corrective_solutions TEXT,
    updated_tasks_json TEXT,
    added_tasks_json TEXT,
    directives_json TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS pilot_ai_config (
    id TEXT PRIMARY KEY,
    api_key TEXT NOT NULL,
    model TEXT NOT NULL,
    system_prompt TEXT,
    generator_prompt TEXT,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS pilot_coffee_groups (
    key TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    bg_image TEXT,
    theme_color TEXT,
    accent_bg TEXT,
    is_custom INTEGER DEFAULT 0,
    order_index INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`;

async function migrateSqliteToPostgresIfEmpty(pgPool, sqliteDb) {
  try {
    const res = await pgPool.query('SELECT COUNT(*) as cnt FROM pilot_coffee_groups');
    const pgCoffeeCount = Number(res.rows[0]?.cnt || 0);
    if (pgCoffeeCount > 0) {
      console.log('[Migration] PostgreSQL already has data, skipping initial SQLite seed.');
      return;
    }

    console.log('[Migration] PostgreSQL tables are empty. Migrating existing SQLite data to PostgreSQL...');

    const tables = [
      'pilot_coffee_groups',
      'pilot_ai_config',
      'pilot_hackathon_criteria',
      'pilot_criteria_selected_virtues',
      'pilot_hackathon_projects',
      'pilot_agency_registrations',
      'pilot_lessons_and_policies',
      'task_project',
      'pms_strategic_plans',
      'pms_projects',
      'pms_kpi_registry',
      'pms_decision_actions',
      'pms_meeting_reports'
    ];

    for (const table of tables) {
      try {
        const rows = sqliteDb.prepare(`SELECT * FROM "${table}"`).all();
        if (rows.length === 0) continue;

        const cols = Object.keys(rows[0]);
        const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
        const insertSql = `INSERT INTO "${table}" (${cols.map(c => `"${c}"`).join(', ')}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;

        for (const row of rows) {
          const values = cols.map(c => row[c]);
          await pgPool.query(insertSql, values);
        }
        console.log(`[Migration] Migrated ${rows.length} rows for table ${table}`);
      } catch (err) {
        console.warn(`[Migration] Warning while migrating table ${table}:`, err.message);
      }
    }
    console.log('[Migration] SQLite data migration to PostgreSQL completed successfully!');
  } catch (err) {
    console.warn('[Migration] Error checking PostgreSQL data:', err.message);
  }
}

async function initDatabase() {
  if (typeof process.loadEnvFile === 'function') {
    try { process.loadEnvFile(); } catch {}
  }

  let databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.PG_URL;
  let targetDbName = 'DB-MDC';

  // If no DATABASE_URL provided, test if local PostgreSQL is available
  if (!databaseUrl) {
    try {
      const testLocal = new Pool({
        connectionString: 'postgres://postgres:postgres@localhost:5432/postgres',
        connectionTimeoutMillis: 1000
      });
      await testLocal.query('SELECT 1');
      await testLocal.end();
      databaseUrl = 'postgres://postgres:postgres@localhost:5432/DB-MDC';
      console.log('[Database] Local PostgreSQL server detected on localhost:5432.');
    } catch {}
  }

  let pgPool = null;

  if (databaseUrl) {
    try {
      // 1. Parse target database name from URL
      try {
        const u = new URL(databaseUrl);
        const pathPart = u.pathname.slice(1);
        if (pathPart && pathPart.toLowerCase() !== 'postgres') {
          targetDbName = decodeURIComponent(pathPart);
        }
      } catch {}

      // 2. Connect to maintenance DB (/postgres) to ensure database targetDbName exists
      const maintUrl = new URL(databaseUrl);
      maintUrl.pathname = '/postgres';
      const maintMasked = maintUrl.toString().replace(/:([^:@]+)@/, ':****@');
      console.log(`[Database] Checking PostgreSQL server via maintenance DB: ${maintMasked}`);

      const maintPool = new Pool({
        connectionString: maintUrl.toString(),
        connectionTimeoutMillis: 5000,
        ssl: databaseUrl.includes('sslmode=require') ? { rejectUnauthorized: false } : false
      });

      try {
        const checkRes = await maintPool.query(
          'SELECT 1 FROM pg_database WHERE datname = $1 OR datname = $2',
          [targetDbName, targetDbName.toLowerCase()]
        );
        if (checkRes.rows.length === 0) {
          console.log(`[Database] PostgreSQL database "${targetDbName}" not found. Creating database "${targetDbName}"...`);
          await maintPool.query(`CREATE DATABASE "${targetDbName}"`);
          console.log(`[Database] Database "${targetDbName}" created successfully!`);
        } else {
          console.log(`[Database] PostgreSQL database "${targetDbName}" exists and is ready.`);
        }
      } catch (checkErr) {
        console.warn('[Database] Maintenance DB check warning:', checkErr.message);
      } finally {
        try { await maintPool.end(); } catch {}
      }

      // 3. Connect application pool directly to targetDbName (DB-MDC)
      const appUrl = new URL(databaseUrl);
      appUrl.pathname = `/${targetDbName}`;
      const appMasked = appUrl.toString().replace(/:([^:@]+)@/, ':****@');
      console.log(`[Database] Connecting main pool to database "${targetDbName}": ${appMasked}`);

      pgPool = new Pool({
        connectionString: appUrl.toString(),
        connectionTimeoutMillis: 5000,
        ssl: databaseUrl.includes('sslmode=require') ? { rejectUnauthorized: false } : false
      });
      await pgPool.query('SELECT 1 as connected');
      console.log(`[Database] Connected to PostgreSQL database "${targetDbName}" successfully!`);

      // 4. Verify & Create all tables and indexes in DB-MDC
      await pgPool.query(PG_SCHEMA_SQL);
      console.log(`[Database] PostgreSQL schema in "${targetDbName}" verified and initialized.`);

      // 5. Seed / Migrate initial data if DB-MDC tables are empty
      if (fs.existsSync(dbPath)) {
        try {
          const localSqlite = new DatabaseSync(dbPath);
          await migrateSqliteToPostgresIfEmpty(pgPool, localSqlite);
        } catch (mErr) {
          console.warn('[Database] Local SQLite migration check warning:', mErr.message);
        }
      }

      // Bootstrap coffee groups if empty
      const coffeeCnt = (await pgPool.query('SELECT COUNT(*) as c FROM pilot_coffee_groups')).rows[0]?.c || 0;
      if (Number(coffeeCnt) === 0) {
        console.log(`[Database] Seeding default 5 coffee groups in "${targetDbName}"...`);
        const now = new Date().toISOString();
        const seedGroups = [
          { key: 'mocha', name: 'กลุ่มมอคค่า', bg_image: '/theme/coffee_mocha_bg.jpg', theme_color: '#78350f', accent_bg: '#fef3c7', is_custom: 0, order_index: 1 },
          { key: 'cappuccino', name: 'กลุ่มคาปูชิโน', bg_image: '/theme/coffee_cappuccino_bg.jpg', theme_color: '#92400e', accent_bg: '#ffedd5', is_custom: 0, order_index: 2 },
          { key: 'americano', name: 'กลุ่มอเมริกาโน', bg_image: '/theme/coffee_americano_bg.jpg', theme_color: '#1c1917', accent_bg: '#f5f5f4', is_custom: 0, order_index: 3 },
          { key: 'espresso', name: 'กลุ่มเอสเพรสโซ', bg_image: '/theme/coffee_preset_05_espresso.jpg', theme_color: '#451a03', accent_bg: '#fef2f2', is_custom: 0, order_index: 4 },
          { key: 'latte', name: 'กลุ่มลาเต้', bg_image: '/theme/coffee_preset_06_latte.jpg', theme_color: '#b45309', accent_bg: '#fffbeb', is_custom: 0, order_index: 5 }
        ];
        for (const g of seedGroups) {
          await pgPool.query(
            `INSERT INTO pilot_coffee_groups (key, name, bg_image, theme_color, accent_bg, is_custom, order_index, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (key) DO NOTHING`,
            [g.key, g.name, g.bg_image, g.theme_color, g.accent_bg, g.is_custom, g.order_index, now, now]
          );
        }
      }

      console.log(`[Database] PostgreSQL DB-MDC ready for Activity Section! (SQLite disabled for activities)`);
      return new UniversalDb(pgPool, null, targetDbName);
    } catch (pgErr) {
      console.warn(`[Database] PostgreSQL connection error: ${pgErr.message}.`);
      if (pgPool) {
        try { await pgPool.end(); } catch {}
        pgPool = null;
      }
    }
  }

  // Development Fallback if offline
  console.log(`[Database] Activity section configured for PostgreSQL DB-MDC. Starting local development fallback...`);
  const sqliteDb = new DatabaseSync(dbPath);
  try {
    sqliteDb.exec('PRAGMA journal_mode = WAL;');
    sqliteDb.exec('PRAGMA busy_timeout = 5000;');
    sqliteDb.exec(PG_SCHEMA_SQL);
  } catch {}

  return new UniversalDb(null, sqliteDb, 'DB-MDC (Offline Simulated)');
}

const db = await initDatabase();

const readJsonBody = (req) =>
  new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString('utf8');
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.pdf': 'application/pdf'
};

async function handleApiRequest(req, res, urlObj) {
  const pathname = urlObj.pathname;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  // ==========================================
  // TASK PROJECT SQLITE ENDPOINTS (/api/task-project)
  // ==========================================
  if (pathname.startsWith('/api/task-project')) {
    if (req.method === 'GET' && pathname === '/api/task-project/list') {
      const allRows = await db.prepare('SELECT * FROM task_project ORDER BY project_id, phase_no, start_date').all();

      const projectMap = {};
      for (const row of allRows) {
        if (!projectMap[row.project_id]) {
          projectMap[row.project_id] = {
            projectId: row.project_id,
            projectName: row.project_name,
            province: row.province,
            organization: row.organization,
            tasks: [],
            totalTasks: 0,
            completedTasks: 0,
            inProgressTasks: 0,
            notStartedTasks: 0,
            overallProgress: 0,
            startDate: row.start_date,
            endDate: row.end_date
          };
        }
        const p = projectMap[row.project_id];
        p.tasks.push(row);
        p.totalTasks++;
        if (row.status === 'เสร็จสิ้น') p.completedTasks++;
        else if (row.status === 'กำลังดำเนินงาน') p.inProgressTasks++;
        else p.notStartedTasks++;

        if (row.start_date < p.startDate) p.startDate = row.start_date;
        if (row.end_date > p.endDate) p.endDate = row.end_date;
      }

      const projects = Object.values(projectMap).map((p) => {
        const sumProg = p.tasks.reduce((sum, t) => sum + (Number(t.progress_percent) || 0), 0);
        p.overallProgress = p.totalTasks > 0 ? Math.round(sumProg / p.totalTasks) : 0;
        return p;
      });

      projects.sort((a, b) => {
        const idxA = CANONICAL_PROJECT_IDS.indexOf(a.projectId);
        const idxB = CANONICAL_PROJECT_IDS.indexOf(b.projectId);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.projectName.localeCompare(b.projectName, 'th');
      });

      res.statusCode = 200;
      res.end(JSON.stringify({ ok: true, projects, totalTasksCount: allRows.length }));
      return;
    }

    if (req.method === 'GET' && pathname === '/api/task-project/by-project') {
      const projectId = urlObj.searchParams.get('projectId');
      if (!projectId) {
        res.statusCode = 400;
        res.end(JSON.stringify({ ok: false, error: 'Missing projectId' }));
        return;
      }
      const tasks = await db.prepare('SELECT * FROM task_project WHERE project_id = ? ORDER BY phase_no, start_date').all(projectId);
      res.statusCode = 200;
      res.end(JSON.stringify({ ok: true, tasks }));
      return;
    }

    if (req.method === 'POST' && pathname === '/api/task-project/save') {
      const payload = await readJsonBody(req);
      const { projectId, projectName, province, organization, tasks } = payload;
      if (!projectId || !Array.isArray(tasks)) {
        res.statusCode = 400;
        res.end(JSON.stringify({ ok: false, error: 'Invalid payload: missing projectId or tasks' }));
        return;
      }

      const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
      await db.prepare('DELETE FROM task_project WHERE project_id = ?').run(projectId);

      const insertStmt = await db.prepare(`
        INSERT INTO task_project (
          id, project_id, project_name, province, organization,
          phase_no, phase_name, task_code, task_name, task_description, deliverable,
          start_date, end_date, duration_days, status, progress_percent,
          responsible_person, dependencies, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (let i = 0; i < tasks.length; i++) {
        const t = tasks[i];
        const taskId = t.id || `tsk-${projectId}-${i + 1}`;
        await insertStmt.run(
          taskId,
          projectId,
          projectName || t.project_name || 'โครงการใหม่',
          province || t.province || 'ส่วนกลาง',
          organization || t.organization || '',
          Number(t.phase_no) || 1,
          t.phase_name || 'ระยะที่ 1',
          t.task_code || `T-${i + 1}`,
          t.task_name || 'กิจกรรม',
          t.task_description || '',
          t.deliverable || '',
          t.start_date || nowStr.slice(0, 10),
          t.end_date || nowStr.slice(0, 10),
          Number(t.duration_days) || 1,
          t.status || 'รอเริ่ม',
          Number(t.progress_percent) || 0,
          t.responsible_person || '',
          t.dependencies || '',
          t.notes || '',
          t.created_at || nowStr,
          nowStr
        );
      }

      const safeId = projectId.replace(/[^a-zA-Z0-9_-]/g, '_');
      const taskFile = path.resolve(taskRecordsDir, `task_project_${safeId}.json`);
      fs.writeFileSync(
        taskFile,
        JSON.stringify({ projectId, projectName, province, tasks, savedAt: nowStr }, null, 2),
        'utf8'
      );

      res.statusCode = 200;
      res.end(JSON.stringify({ ok: true, projectId, count: tasks.length }));
      return;
    }

    if (req.method === 'POST' && pathname === '/api/task-project/update-progress') {
      const payload = await readJsonBody(req);
      const { updates, meetingId, meetingNotes } = payload;
      if (!Array.isArray(updates)) {
        res.statusCode = 400;
        res.end(JSON.stringify({ ok: false, error: 'Invalid updates array' }));
        return;
      }

      const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
      const updateStmt = await db.prepare(`
        UPDATE task_project 
        SET status = ?, progress_percent = ?, last_meeting_id = ?, last_meeting_notes = ?, updated_by_meeting_at = ?, updated_at = ?
        WHERE id = ?
      `);

      let count = 0;
      for (const u of updates) {
        if (u.id) {
          await updateStmt.run(
            u.status || 'กำลังดำเนินงาน',
            Number(u.progress_percent) || 0,
            meetingId || u.last_meeting_id || null,
            meetingNotes || u.last_meeting_notes || null,
            nowStr,
            nowStr,
            u.id
          );
          count++;
        }
      }

      res.statusCode = 200;
      res.end(JSON.stringify({ ok: true, updatedCount: count }));
      return;
    }

    if (req.method === 'POST' && pathname === '/api/task-project/append-tasks') {
      const payload = await readJsonBody(req);
      const { projectId, newTasks, meetingId, meetingNotes } = payload;
      if (!projectId || !Array.isArray(newTasks) || newTasks.length === 0) {
        res.statusCode = 400;
        res.end(JSON.stringify({ ok: false, error: 'Invalid payload: missing projectId or newTasks' }));
        return;
      }

      const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
      const insertStmt = await db.prepare(`
        INSERT INTO task_project (
          id, project_id, project_name, province, organization,
          phase_no, phase_name, task_code, task_name, task_description, deliverable,
          start_date, end_date, duration_days, status, progress_percent,
          responsible_person, dependencies, notes, last_meeting_id, last_meeting_notes,
          updated_by_meeting_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      let addedCount = 0;
      for (const t of newTasks) {
        const taskId = t.id || `tsk-${projectId}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        await insertStmt.run(
          taskId,
          projectId,
          t.project_name || 'โครงการ',
          t.province || 'ส่วนกลาง',
          t.organization || '',
          Number(t.phase_no) || 2,
          t.phase_name || `ระยะที่ ${t.phase_no || 2}`,
          t.task_code || `T-${t.phase_no || 2}.x`,
          t.task_name,
          t.task_description || '',
          t.deliverable || 'ผลผลิตตามมติที่ประชุม',
          t.start_date || nowStr.slice(0, 10),
          t.end_date || nowStr.slice(0, 10),
          Number(t.duration_days) || 14,
          t.status || 'รอเริ่ม',
          Number(t.progress_percent) || 0,
          t.responsible_person || 'คณะทำงาน',
          t.dependencies || '-',
          t.notes || (t.reason_added ? `✨ เพิ่มจากมติที่ประชุม: ${t.reason_added}` : '✨ เพิ่มจากมติที่ประชุม'),
          meetingId || null,
          meetingNotes || null,
          nowStr,
          nowStr,
          nowStr
        );
        addedCount++;
      }

      res.statusCode = 200;
      res.end(JSON.stringify({ ok: true, addedCount }));
      return;
    }

    if (req.method === 'DELETE' && pathname === '/api/task-project/delete') {
      const projectId = urlObj.searchParams.get('projectId');
      if (projectId) {
        await db.prepare('DELETE FROM task_project WHERE project_id = ?').run(projectId);
      }
      res.statusCode = 200;
      res.end(JSON.stringify({ ok: true }));
      return;
    }
  }

  // ==========================================
  // PMS MEETING REPORT ENDPOINTS (/api/pms-report)
  // ==========================================
  if (pathname.startsWith('/api/pms-report')) {
    if (req.method === 'GET' && pathname === '/api/pms-report/list') {
      const reports = await db.prepare('SELECT * FROM pms_meeting_reports ORDER BY meeting_date DESC, created_at DESC').all();
      res.statusCode = 200;
      res.end(JSON.stringify({ ok: true, reports }));
      return;
    }

    if (req.method === 'GET' && pathname === '/api/pms-report/by-project') {
      const projectId = urlObj.searchParams.get('projectId');
      if (!projectId) {
        res.statusCode = 400;
        res.end(JSON.stringify({ ok: false, error: 'Missing projectId' }));
        return;
      }
      const reports = await db.prepare('SELECT * FROM pms_meeting_reports WHERE project_id = ? ORDER BY meeting_date DESC, created_at DESC').all(projectId);
      res.statusCode = 200;
      res.end(JSON.stringify({ ok: true, reports }));
      return;
    }

    if (req.method === 'POST' && pathname === '/api/pms-report/save') {
      const p = await readJsonBody(req);
      const id = p.id || `REP02-${p.meetingId || Date.now()}`;
      const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

      const stmt = await db.prepare(`
        INSERT OR REPLACE INTO pms_meeting_reports (
          id, meeting_id, project_id, project_name, province,
          meeting_date, meeting_topic, reporting_period, executive_summary,
          source_file_name, obstacles_and_risks, corrective_solutions,
          updated_tasks_json, added_tasks_json, directives_json,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      await stmt.run(
        id,
        p.meetingId || '',
        p.projectId || '',
        p.projectName || '',
        p.province || '',
        p.meetingDate || nowStr.slice(0, 10),
        p.meetingTopic || '',
        p.reportingPeriod || 'ประจำเดือน',
        p.executiveSummary || '',
        p.sourceFileName || '',
        Array.isArray(p.obstaclesAndRisks) ? JSON.stringify(p.obstaclesAndRisks) : p.obstaclesAndRisks || '[]',
        Array.isArray(p.correctiveSolutions) ? JSON.stringify(p.correctiveSolutions) : p.correctiveSolutions || '[]',
        Array.isArray(p.updatedTasks) ? JSON.stringify(p.updatedTasks) : p.updatedTasks || '[]',
        Array.isArray(p.addedTasks) ? JSON.stringify(p.addedTasks) : p.addedTasks || '[]',
        Array.isArray(p.directives) ? JSON.stringify(p.directives) : p.directives || '[]',
        p.createdAt || nowStr,
        nowStr
      );

      res.statusCode = 200;
      res.end(JSON.stringify({ ok: true, id }));
      return;
    }
  }

  // 1. GET /api/pilot-sqlite/state
  if (req.method === 'GET' && (pathname === '/api/activity/state' || pathname === '/api/pilot-sqlite/state')) {
    const province = urlObj.searchParams.get('province');
    const provList = province
      ? (province === 'อยุธยา' || province === 'พระนครศรีอยุธยา'
          ? ['อยุธยา', 'พระนครศรีอยุธยา']
          : [province])
      : null;

    const agencies = provList
      ? await db
          .prepare(`SELECT * FROM pilot_agency_registrations WHERE province IN (${provList.map(() => '?').join(',')}) ORDER BY created_at DESC`)
          .all(...provList)
      : await db.prepare('SELECT * FROM pilot_agency_registrations ORDER BY created_at DESC').all();

    const lessonsPolicies = provList
      ? await db
          .prepare(`SELECT * FROM pilot_lessons_and_policies WHERE province IN (${provList.map(() => '?').join(',')}) ORDER BY updated_at DESC`)
          .all(...provList)
      : await db.prepare('SELECT * FROM pilot_lessons_and_policies ORDER BY updated_at DESC').all();

    res.statusCode = 200;
    res.end(
      JSON.stringify({
        ok: true,
        dbPath: 'PostgreSQL 16 (DB-MDC)', database: 'DB-MDC', engine: 'PostgreSQL 16',
        recordsDir: 'data/pilot_records/',
        agencies,
        lessonsPolicies
      })
    );
    return;
  }

  // 2. POST /api/pilot-sqlite/register-agency
  if (req.method === 'POST' && (pathname === '/api/activity/register-agency' || pathname === '/api/pilot-sqlite/register-agency')) {
    const payload = await readJsonBody(req);
    const id = payload.id || `reg-${Date.now()}`;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const firstName = (payload.first_name || (payload.coordinator_name ? payload.coordinator_name.trim().split(/\s+/)[0] : '')).trim();
    const lastName = (payload.last_name || (payload.coordinator_name ? payload.coordinator_name.trim().split(/\s+/).slice(1).join(' ') : '')).trim();
    const pos = (payload.position || (payload.participant_role ? payload.participant_role.replace(/\(.*\)/, '').trim() : 'ผู้ร่วมกิจกรรม')).trim();
    const level = payload.participant_level || (payload.participant_role?.includes('นโยบาย') ? 'policy' : payload.participant_role?.includes('ประชาชน') ? 'citizen' : 'practitioner');
    const phone = (payload.phone || '').trim();
    const email = (payload.email || '').trim();
    const coffeeGroup = payload.coffee_group || 'mocha';
    const coordName = payload.coordinator_name || [firstName, lastName].filter(Boolean).join(' ');
    const roleStr = payload.participant_role || `${pos} (${level === 'policy' ? 'ระดับนโยบาย' : level === 'practitioner' ? 'ระดับผู้ปฏิบัติการ' : 'ระดับประชาชน'})`;
    const contactStr = payload.contact_info || [phone, email].filter(Boolean).join(' / ');

    const stmt = await db.prepare(`
      INSERT OR REPLACE INTO pilot_agency_registrations (
        id, province, region, agency_name, agency_type,
        first_name, last_name, position, participant_level,
        coordinator_name, participant_role, district, subdistrict,
        phone, email, contact_info, coffee_group,
        trial_project_name, trial_project_summary, activity_date, synergy_topic,
        uploaded_files_json, extracted_data_preview, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    await stmt.run(
      id,
      payload.province || 'อยุธยา',
      payload.region || 'ภาคกลาง',
      payload.agency_name || '',
      payload.agency_type || 'ภาครัฐ',
      firstName,
      lastName,
      pos,
      level,
      coordName,
      roleStr,
      payload.district || '',
      payload.subdistrict || '',
      phone,
      email,
      contactStr,
      coffeeGroup,
      payload.trial_project_name || '',
      payload.trial_project_summary || '',
      payload.activity_date || nowStr.slice(0, 10),
      payload.synergy_topic || '',
      JSON.stringify(payload.uploaded_files || []),
      payload.extracted_data_preview || '',
      payload.created_at || nowStr
    );

    const safeId = id.replace(/[^a-zA-Z0-9_-]/g, '_');
    const agencyFilePath = path.resolve(recordsDir, `agency_${safeId}.json`);
    fs.writeFileSync(
      agencyFilePath,
      JSON.stringify({ id, ...payload, savedAt: nowStr, sqliteDb: 'data/pilot_activities_4regions.sqlite' }, null, 2),
      'utf8'
    );

    res.statusCode = 200;
    res.end(
      JSON.stringify({
        ok: true,
        id,
        savedFilePath: `data/pilot_records/agency_${safeId}.json`,
        dbPath: 'PostgreSQL 16 (DB-MDC)', database: 'DB-MDC', engine: 'PostgreSQL 16'
      })
    );
    return;
  }

  // 3. POST /api/pilot-sqlite/save-lesson-policy
  if (req.method === 'POST' && (pathname === '/api/activity/save-lesson-policy' || pathname === '/api/pilot-sqlite/save-lesson-policy')) {
    const payload = await readJsonBody(req);
    const id = payload.id || `lp-${Date.now()}`;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const safeId = id.replace(/[^a-zA-Z0-9_-]/g, '_');
    const relFilePath = `data/pilot_records/pilot_lesson_policy_${safeId}.json`;
    const relMdPath = `data/pilot_records/pilot_lesson_policy_${safeId}.md`;
    const absJsonPath = path.resolve(recordsDir, `pilot_lesson_policy_${safeId}.json`);
    const absMdPath = path.resolve(recordsDir, `pilot_lesson_policy_${safeId}.md`);

    const stmt = await db.prepare(`
      INSERT OR REPLACE INTO pilot_lessons_and_policies (
        id, province, region, activity_date, selected_project_ids_json, selected_project_names_json,
        summary_file_name, raw_activity_summary, lesson_learned_text, lesson_structured_json,
        policy_prompt, generated_policy_text, policy_structured_json, saved_file_path, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    await stmt.run(
      id,
      payload.province || 'อยุธยา',
      payload.region || '',
      payload.activity_date || nowStr.slice(0, 10),
      JSON.stringify(payload.selected_project_ids || []),
      JSON.stringify(payload.selected_project_names || []),
      payload.summary_file_name || '',
      payload.raw_activity_summary || '',
      payload.lesson_learned_text || '',
      JSON.stringify(payload.lesson_structured || {}),
      payload.policy_prompt || '',
      payload.generated_policy_text || '',
      JSON.stringify(payload.policy_structured || {}),
      `${relFilePath} | ${relMdPath}`,
      nowStr
    );

    const fileRecord = {
      id,
      province: payload.province,
      region: payload.region,
      activity_date: payload.activity_date,
      selected_project_names: payload.selected_project_names || [],
      summary_file_name: payload.summary_file_name || '',
      lesson_learned_text: payload.lesson_learned_text || '',
      lesson_structured: payload.lesson_structured || {},
      policy_prompt: payload.policy_prompt || '',
      generated_policy_text: payload.generated_policy_text || '',
      policy_structured: payload.policy_structured || {},
      sqlite_db: 'data/pilot_activities_4regions.sqlite',
      updated_at: nowStr
    };
    fs.writeFileSync(absJsonPath, JSON.stringify(fileRecord, null, 2), 'utf8');

    const mdContent = [
      `# รายงานการถอดบทเรียนและข้อเสนอนโยบาย: กิจกรรมนำร่องจังหวัด${payload.province || ''}`,
      `- **รหัสรายการ:** ${id}`,
      `- **จังหวัดนำร่อง:** ${payload.province || ''} (${payload.region || ''})`,
      `- **วันที่จัดกิจกรรม:** ${payload.activity_date || nowStr.slice(0, 10)}`,
      `- **โครงการที่ทดลองสร้างในกิจกรรม:** ${(payload.selected_project_names || []).join(', ') || '-'}`,
      `- **ไฟล์สรุปกิจกรรม:** ${payload.summary_file_name || '-'}`,
      `- **บันทึกเมื่อ:** ${nowStr}`,
      ``,
      `---`,
      ``,
      `## 1. ผลการถอดบทเรียน (Lesson Learned)`,
      payload.lesson_learned_text || '-',
      ``,
      `---`,
      ``,
      `## 2. Prompt สำหรับสร้างนโยบาย (Policy Generation Prompt)`,
      payload.policy_prompt || '-',
      ``,
      `## 3. ข้อเสนอนโยบายจาก AI (Generated Policy Recommendations)`,
      payload.generated_policy_text || '- (ยังไม่ได้กด Generate นโยบาย)'
    ].join('\n');
    fs.writeFileSync(absMdPath, mdContent, 'utf8');

    res.statusCode = 200;
    res.end(
      JSON.stringify({
        ok: true,
        id,
        updated_at: nowStr,
        savedFilePath: `${relFilePath} | ${relMdPath}`,
        dbPath: 'PostgreSQL 16 (DB-MDC)', database: 'DB-MDC', engine: 'PostgreSQL 16'
      })
    );
    return;
  }

  // 4. DELETE /api/pilot-sqlite/agency
  if (req.method === 'DELETE' && (pathname === '/api/activity/agency' || pathname === '/api/pilot-sqlite/agency')) {
    const id = urlObj.searchParams.get('id');
    if (id) {
      await db.prepare('DELETE FROM pilot_agency_registrations WHERE id = ?').run(id);
    }
    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  // 5. DELETE /api/pilot-sqlite/lesson-policy
  if (req.method === 'DELETE' && (pathname === '/api/activity/lesson-policy' || pathname === '/api/pilot-sqlite/lesson-policy')) {
    const id = urlObj.searchParams.get('id');
    if (id) {
      await db.prepare('DELETE FROM pilot_lessons_and_policies WHERE id = ?').run(id);
    }
    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  // 5.1 GET /api/pilot-sqlite/hackathon-criteria
  if (req.method === 'GET' && (pathname === '/api/activity/hackathon-criteria' || pathname === '/api/pilot-sqlite/hackathon-criteria')) {
    const province = urlObj.searchParams.get('province') || '';
    let row = null;
    if (province) {
      row = await db.prepare(
        `SELECT * FROM pilot_hackathon_criteria 
         WHERE is_active = 1 AND (province = ? OR province = 'ส่วนกลาง') 
         ORDER BY CASE WHEN province = ? THEN 0 ELSE 1 END, updated_at DESC LIMIT 1`
      ).get(province, province);
    }
    if (!row) {
      row = await db.prepare('SELECT * FROM pilot_hackathon_criteria WHERE is_active = 1 ORDER BY updated_at DESC LIMIT 1').get();
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.end(JSON.stringify({ ok: true, data: row || null, dbPath: 'PostgreSQL 16 (DB-MDC)', database: 'DB-MDC', engine: 'PostgreSQL 16' }));
    return;
  }

  // 5.2 POST /api/pilot-sqlite/hackathon-criteria
  if (req.method === 'POST' && (pathname === '/api/activity/hackathon-criteria' || pathname === '/api/pilot-sqlite/hackathon-criteria')) {
    const body = await readJsonBody(req);
    const id = body.id || `crit-${Date.now()}`;
    const province = body.province || 'ส่วนกลาง';
    const now = new Date().toISOString();
    const sourceFilesJson = typeof body.sourceFilesJson === 'string' ? body.sourceFilesJson : JSON.stringify(body.sourceFiles || []);
    const aiAgentSkillText = body.aiAgentSkillText || '';
    const rubricJson = typeof body.rubricJson === 'string' ? body.rubricJson : JSON.stringify(body.rubric || []);
    const promptSkill = body.promptSkill || '';
    const promptRubric = body.promptRubric || '';

    if (body.setLatestActive !== false) {
      await db.prepare('UPDATE pilot_hackathon_criteria SET is_active = 0 WHERE province = ?').run(province);
    }

    await db.prepare(`
      INSERT OR REPLACE INTO pilot_hackathon_criteria 
      (id, province, created_at, updated_at, source_files_json, ai_agent_skill_text, rubric_json, prompt_skill, prompt_rubric, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).run(id, province, body.createdAt || now, now, sourceFilesJson, aiAgentSkillText, rubricJson, promptSkill, promptRubric);

    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true, id, dbPath: 'PostgreSQL 16 (DB-MDC)', database: 'DB-MDC', engine: 'PostgreSQL 16', updatedAt: now }));
    return;
  }

  // 5.2.1 GET /api/pilot-sqlite/criteria-virtues
  if (req.method === 'GET' && (pathname === '/api/activity/criteria-virtues' || pathname === '/api/pilot-sqlite/criteria-virtues')) {
    const province = urlObj.searchParams.get('province') || 'ส่วนกลาง';
    const defaultWeaknessMap = {
      'อยุธยา': ['พอเพียง'],
      'ระยอง': ['พอเพียง'],
      'กาฬสินธุ์': ['สุจริต'],
      'หนองคาย': ['สุจริต'],
      'น่าน': ['กตัญญู'],
      'ลำปาง': ['กตัญญู'],
      'สุราษฎร์ธานี': ['จิตอาสา'],
      'พังงา': ['จิตอาสา']
    };
    let row = await db.prepare('SELECT * FROM pilot_criteria_selected_virtues WHERE province = ?').get(province);
    if (!row) {
      row = await db.prepare('SELECT * FROM pilot_criteria_selected_virtues WHERE province = ?').get('ส่วนกลาง');
    }
    let virtues = defaultWeaknessMap[province] || ['พอเพียง'];
    if (row && row.selected_virtues_json) {
      try {
        const parsed = JSON.parse(row.selected_virtues_json);
        if (Array.isArray(parsed) && parsed.length > 0) virtues = parsed;
      } catch {}
    }
    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true, province, virtues, updatedAt: row?.updated_at || null }));
    return;
  }

  // 5.2.2 POST /api/pilot-sqlite/criteria-virtues
  if (req.method === 'POST' && (pathname === '/api/activity/criteria-virtues' || pathname === '/api/pilot-sqlite/criteria-virtues')) {
    const body = await readJsonBody(req);
    const province = body.province || 'ส่วนกลาง';
    const defaultWeaknessMap = {
      'อยุธยา': ['พอเพียง'],
      'ระยอง': ['พอเพียง'],
      'กาฬสินธุ์': ['สุจริต'],
      'หนองคาย': ['สุจริต'],
      'น่าน': ['กตัญญู'],
      'ลำปาง': ['กตัญญู'],
      'สุราษฎร์ธานี': ['จิตอาสา'],
      'พังงา': ['จิตอาสา']
    };
    const defaultFallback = defaultWeaknessMap[province] || ['พอเพียง'];
    const virtues = Array.isArray(body.virtues) && body.virtues.length > 0
      ? body.virtues
      : defaultFallback;
    const now = new Date().toISOString();
    await db.prepare(`
      INSERT OR REPLACE INTO pilot_criteria_selected_virtues (province, selected_virtues_json, updated_at)
      VALUES (?, ?, ?)
    `).run(province, JSON.stringify(virtues), now);

    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true, province, virtues, updatedAt: now }));
    return;
  }

  // 5.2.3 GET /api/pilot-sqlite/ai-config
  if (req.method === 'GET' && (pathname === '/api/activity/ai-config' || pathname === '/api/pilot-sqlite/ai-config')) {
    try {
      let row = await db.prepare('SELECT * FROM pilot_ai_config WHERE id = ?').get('default');
      if (!row && fs.existsSync(aiConfigFile)) {
        try {
          const fileData = JSON.parse(fs.readFileSync(aiConfigFile, 'utf8'));
          if (fileData && fileData.apiKey) {
            const now = new Date().toISOString();
            await db.prepare(`
              INSERT OR REPLACE INTO pilot_ai_config (id, api_key, model, system_prompt, generator_prompt, updated_at)
              VALUES (?, ?, ?, ?, ?, ?)
            `).run('default', fileData.apiKey, fileData.model || 'openai/gpt-4o-mini', fileData.systemPrompt || '', fileData.generatorPrompt || '', now);
            row = {
              id: 'default',
              api_key: fileData.apiKey,
              model: fileData.model || 'openai/gpt-4o-mini',
              system_prompt: fileData.systemPrompt || '',
              generator_prompt: fileData.generatorPrompt || '',
              updated_at: now
            };
          }
        } catch (e) {
          console.warn('Failed parsing aiConfigFile:', e);
        }
      }

      if (row && row.api_key) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({
          ok: true,
          isConfigured: true,
          apiKey: row.api_key,
          model: row.model || 'openai/gpt-4o-mini',
          systemPrompt: row.system_prompt || '',
          generatorPrompt: row.generator_prompt || '',
          updatedAt: row.updated_at
        }));
        return;
      }

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({
        ok: true,
        isConfigured: false,
        apiKey: '',
        model: 'openai/gpt-4o-mini',
        systemPrompt: '',
        generatorPrompt: '',
        updatedAt: null
      }));
      return;
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: false, error: err?.message || 'Failed to read AI config' }));
      return;
    }
  }

  // 5.2.4 POST /api/pilot-sqlite/ai-config
  if (req.method === 'POST' && (pathname === '/api/activity/ai-config' || pathname === '/api/pilot-sqlite/ai-config')) {
    try {
      const body = await readJsonBody(req);
      const apiKey = (body.apiKey || '').trim().replace(/^["']|["']$/g, '');
      const model = (body.model || 'openai/gpt-4o-mini').trim();
      const systemPrompt = (body.systemPrompt || '').trim();
      const generatorPrompt = (body.generatorPrompt || '').trim();
      const now = new Date().toISOString();

      await db.prepare(`
        INSERT OR REPLACE INTO pilot_ai_config (id, api_key, model, system_prompt, generator_prompt, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run('default', apiKey, model, systemPrompt, generatorPrompt, now);

      try {
        fs.writeFileSync(aiConfigFile, JSON.stringify({
          apiKey,
          model,
          systemPrompt,
          generatorPrompt,
          updatedAt: now
        }, null, 2), 'utf8');
      } catch (err) {
        console.warn('Failed writing ai_config.json:', err);
      }

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({
        ok: true,
        message: 'บันทึกการตั้งค่า AI ลง SQLite และ Server File เรียบร้อยแล้ว (ทุกเครื่องเชื่อมต่อได้ทันที)',
        isConfigured: Boolean(apiKey),
        apiKey,
        model,
        systemPrompt,
        generatorPrompt,
        updatedAt: now
      }));
      return;
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: false, error: err?.message || 'Failed to save AI config' }));
      return;
    }
  }

  // 5.2.5 GET /api/pilot-sqlite/coffee-groups
  if (req.method === 'GET' && (pathname === '/api/activity/coffee-groups' || pathname === '/api/pilot-sqlite/coffee-groups')) {
    try {
      const rows = await db.prepare('SELECT * FROM pilot_coffee_groups ORDER BY order_index ASC, created_at ASC').all();
      const groups = rows.map((r) => ({
        key: r.key,
        name: r.name,
        bgImage: r.bg_image,
        themeColor: r.theme_color,
        accentBg: r.accent_bg,
        isCustom: Boolean(r.is_custom)
      }));
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: true, groups }));
      return;
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: false, error: err?.message || 'Failed to fetch coffee groups' }));
      return;
    }
  }

  // 5.2.6 POST /api/pilot-sqlite/coffee-groups
  if (req.method === 'POST' && (pathname === '/api/activity/coffee-groups' || pathname === '/api/pilot-sqlite/coffee-groups')) {
    try {
      const body = await readJsonBody(req);
      const now = new Date().toISOString();

      if (body.action === 'reset') {
        await db.prepare('DELETE FROM pilot_coffee_groups').run();
        const defaultGroups = [
          { key: 'mocha', name: 'กลุ่มมอคค่า', bg_image: '/theme/coffee_mocha_bg.jpg', theme_color: '#78350f', accent_bg: '#fef3c7', is_custom: 0, order_index: 1 },
          { key: 'cappuccino', name: 'กลุ่มคาปูชิโน', bg_image: '/theme/coffee_cappuccino_bg.jpg', theme_color: '#92400e', accent_bg: '#ffedd5', is_custom: 0, order_index: 2 },
          { key: 'americano', name: 'กลุ่มอเมริกาโน', bg_image: '/theme/coffee_americano_bg.jpg', theme_color: '#1c1917', accent_bg: '#f5f5f4', is_custom: 0, order_index: 3 },
          { key: 'espresso', name: 'กลุ่มเอสเพรสโซ', bg_image: '/theme/coffee_preset_05_espresso.jpg', theme_color: '#451a03', accent_bg: '#fef2f2', is_custom: 0, order_index: 4 },
          { key: 'latte', name: 'กลุ่มลาเต้', bg_image: '/theme/coffee_preset_06_latte.jpg', theme_color: '#b45309', accent_bg: '#fffbeb', is_custom: 0, order_index: 5 }
        ];
        const insertStmt = await db.prepare(`
          INSERT INTO pilot_coffee_groups (key, name, bg_image, theme_color, accent_bg, is_custom, order_index, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const g of defaultGroups) {
          await insertStmt.run(g.key, g.name, g.bg_image, g.theme_color, g.accent_bg, g.is_custom, g.order_index, now, now);
        }
      } else {
        const grp = body.group || body;
        const currentRows = await db.prepare('SELECT * FROM pilot_coffee_groups').all();
        const rawKey = (grp.key || `group_${Date.now()}`).toLowerCase().replace(/[^a-z0-9]/g, '_');
        const key = currentRows.some((r) => r.key === rawKey && (!body.isEdit || body.originalKey !== r.key))
          ? (body.isEdit ? rawKey : `${rawKey}_${Date.now()}`)
          : rawKey;

        const maxOrder = await db.prepare('SELECT MAX(order_index) as m FROM pilot_coffee_groups').get()?.m || 0;
        const orderIndex = typeof grp.orderIndex === 'number' ? grp.orderIndex : maxOrder + 1;

        await db.prepare(`
          INSERT OR REPLACE INTO pilot_coffee_groups 
          (key, name, bg_image, theme_color, accent_bg, is_custom, order_index, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, COALESCE((SELECT created_at FROM pilot_coffee_groups WHERE key = ?), ?), ?)
        `).run(
          key,
          grp.name || 'กลุ่มกาแฟสร้างสรรค์คุณธรรม',
          grp.bgImage || grp.bg_image || '/theme/coffee_preset_01_beans.jpg',
          grp.themeColor || grp.theme_color || '#78350f',
          grp.accentBg || grp.accent_bg || '#fef3c7',
          grp.isCustom !== undefined ? (grp.isCustom ? 1 : 0) : 1,
          orderIndex,
          key,
          now,
          now
        );
      }

      const rows = await db.prepare('SELECT * FROM pilot_coffee_groups ORDER BY order_index ASC, created_at ASC').all();
      const groups = rows.map((r) => ({
        key: r.key,
        name: r.name,
        bgImage: r.bg_image,
        themeColor: r.theme_color,
        accentBg: r.accent_bg,
        isCustom: Boolean(r.is_custom)
      }));

      try {
        fs.writeFileSync(coffeeGroupsFile, JSON.stringify(groups, null, 2), 'utf8');
      } catch {}

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: true, groups, message: 'บันทึกกลุ่มกาแฟลง SQLite เรียบร้อยแล้ว' }));
      return;
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: false, error: err?.message || 'Failed to save coffee group' }));
      return;
    }
  }

  // 5.2.7 DELETE /api/pilot-sqlite/coffee-groups
  if (req.method === 'DELETE' && (pathname === '/api/activity/coffee-groups' || pathname === '/api/pilot-sqlite/coffee-groups')) {
    try {
      const key = urlObj.searchParams.get('key');
      if (!key) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ ok: false, error: 'Missing key parameter' }));
        return;
      }
      const count = await db.prepare('SELECT COUNT(*) as cnt FROM pilot_coffee_groups').get()?.cnt || 0;
      if (count <= 1) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ ok: false, error: 'ไม่สามารถลบกลุ่มทั้งหมดได้ ต้องมีอย่างน้อย 1 กลุ่ม' }));
        return;
      }

      await db.prepare('DELETE FROM pilot_coffee_groups WHERE key = ?').run(key);

      const rows = await db.prepare('SELECT * FROM pilot_coffee_groups ORDER BY order_index ASC, created_at ASC').all();
      const groups = rows.map((r) => ({
        key: r.key,
        name: r.name,
        bgImage: r.bg_image,
        themeColor: r.theme_color,
        accentBg: r.accent_bg,
        isCustom: Boolean(r.is_custom)
      }));

      try {
        fs.writeFileSync(coffeeGroupsFile, JSON.stringify(groups, null, 2), 'utf8');
      } catch {}

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: true, groups, message: 'ลบกลุ่มกาแฟจาก SQLite เรียบร้อยแล้ว' }));
      return;
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: false, error: err?.message || 'Failed to delete coffee group' }));
      return;
    }
  }

  // 5.3 GET /api/pilot-sqlite/hackathon-projects
  if (req.method === 'GET' && (pathname === '/api/activity/hackathon-projects' || pathname === '/api/pilot-sqlite/hackathon-projects')) {
    const rawProvince = (urlObj.searchParams.get('province') || '').trim();
    const includePrecheck = urlObj.searchParams.get('include_precheck') === 'true';
    let rows = [];
    const precheckFilter = includePrecheck
      ? ''
      : "AND (is_precheck = 0 OR is_precheck IS NULL) AND id NOT LIKE 'precheck-%'";
    if (rawProvince) {
      let matchProvs = [rawProvince];
      if (rawProvince === 'อยุธยา' || rawProvince === 'พระนครศรีอยุธยา') {
        matchProvs = ['อยุธยา', 'พระนครศรีอยุธยา'];
      } else if (rawProvince === 'อุดรธานี' || rawProvince === 'กาฬสินธุ์') {
        matchProvs = ['อุดรธานี', 'กาฬสินธุ์'];
      } else if (rawProvince === 'ลำปาง' || rawProvince === 'น่าน') {
        matchProvs = ['ลำปาง', 'น่าน'];
      } else if (rawProvince === 'สุราษฎร์ธานี' || rawProvince === 'พังงา') {
        matchProvs = ['สุราษฎร์ธานี', 'พังงา'];
      }
      const placeholders = matchProvs.map(() => '?').join(', ');
      rows = await db.prepare(`SELECT * FROM pilot_hackathon_projects WHERE province IN (${placeholders}) ${precheckFilter} ORDER BY created_at DESC`).all(...matchProvs);
    } else {
      const whereClause = includePrecheck
        ? ''
        : "WHERE (is_precheck = 0 OR is_precheck IS NULL) AND id NOT LIKE 'precheck-%'";
      rows = await db.prepare(`SELECT * FROM pilot_hackathon_projects ${whereClause} ORDER BY created_at DESC`).all();
    }
    const projects = rows.map((r) => ({
      id: r.id,
      province: r.province,
      groupKey: r.group_key,
      groupName: r.group_name,
      projectName: r.project_name,
      targetMoralVirtue: r.target_moral_virtue,
      targetAudience: r.target_audience,
      targetArea: r.target_area,
      proposalDetails: r.proposal_details,
      activityPlan: r.activity_plan,
      behavioralKpi: r.behavioral_kpi,
      proposerName: r.proposer_name,
      proposerAgency: r.proposer_agency,
      proposerPosition: r.proposer_position || '',
      proposerLevel: r.proposer_level,
      challengeTopic: r.challenge_topic,
      evaluatedCriteriaVirtues: r.evaluated_criteria_virtues_json ? JSON.parse(r.evaluated_criteria_virtues_json) : [],
      aiScore: Number(r.ai_score),
      aiScoreBreakdown: r.ai_score_breakdown_json ? JSON.parse(r.ai_score_breakdown_json) : { alignment: 0, feasibility: 0, innovation: 0, participation: 0 },
      aiRecommendations: r.ai_recommendations,
      communityVotes: Number(r.community_votes || 0),
      isPrecheck: Boolean(r.is_precheck),
      createdAt: r.created_at
    }));

    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true, data: projects, total: projects.length, dbPath: 'PostgreSQL 16 (DB-MDC)', database: 'DB-MDC', engine: 'PostgreSQL 16' }));
    return;
  }

  // 5.4 POST /api/pilot-sqlite/hackathon-projects
  if (req.method === 'POST' && (pathname === '/api/activity/hackathon-projects' || pathname === '/api/pilot-sqlite/hackathon-projects')) {
    const body = await readJsonBody(req);
    const id = body.id || `proj-${body.groupKey || 'group'}-${Date.now()}`;
    const province = body.province || 'ส่วนกลาง';
    const now = new Date().toISOString();
    const groupKey = body.groupKey || 'mocha';
    const groupName = body.groupName || 'กลุ่มสร้างสรรค์คุณธรรม';
    const projectName = body.projectName || 'โครงการคุณธรรม';
    const targetMoralVirtue = body.targetMoralVirtue || 'คุณธรรม';
    const targetAudience = body.targetAudience || '';
    const targetArea = body.targetArea || '';
    const proposalDetails = body.proposalDetails || '';
    const activityPlan = body.activityPlan || '';
    const behavioralKpi = body.behavioralKpi || '';
    const proposerName = body.proposerName || '';
    const proposerAgency = body.proposerAgency || '';
    const proposerPosition = body.proposerPosition || '';
    const proposerLevel = body.proposerLevel || 'practitioner';
    const challengeTopic = body.challengeTopic || '';
    const evaluatedCriteriaVirtuesJson = typeof body.evaluatedCriteriaVirtues === 'string'
      ? body.evaluatedCriteriaVirtues
      : JSON.stringify(body.evaluatedCriteriaVirtues || []);
    const aiScore = Number(body.aiScore || 80.0);
    const aiScoreBreakdownJson = typeof body.aiScoreBreakdown === 'string'
      ? body.aiScoreBreakdown
      : JSON.stringify(body.aiScoreBreakdown || { alignment: 24, feasibility: 24, innovation: 16, participation: 16 });
    const aiRecommendations = body.aiRecommendations || '';
    const communityVotes = typeof body.communityVotes === 'number'
      ? body.communityVotes
      : (body.communityVotes !== undefined && body.communityVotes !== null && !isNaN(Number(body.communityVotes)))
        ? Number(body.communityVotes)
        : 0;
    const isPrecheck = body.isPrecheck ? 1 : 0;
    const createdAt = body.createdAt || now;

    await db.prepare(`
      INSERT OR REPLACE INTO pilot_hackathon_projects (
        id, province, group_key, group_name, project_name, target_moral_virtue,
        target_audience, target_area, proposal_details, activity_plan, behavioral_kpi,
        proposer_name, proposer_agency, proposer_position, proposer_level, challenge_topic,
        evaluated_criteria_virtues_json, ai_score, ai_score_breakdown_json, ai_recommendations,
        community_votes, is_precheck, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, province, groupKey, groupName, projectName, targetMoralVirtue,
      targetAudience, targetArea, proposalDetails, activityPlan, behavioralKpi,
      proposerName, proposerAgency, proposerPosition, proposerLevel, challengeTopic,
      evaluatedCriteriaVirtuesJson, aiScore, aiScoreBreakdownJson, aiRecommendations,
      communityVotes, isPrecheck, createdAt, now
    );

    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true, id, dbPath: 'PostgreSQL 16 (DB-MDC)', database: 'DB-MDC', engine: 'PostgreSQL 16', aiScore, isPrecheck, updatedAt: now }));
    return;
  }

  // 5.4.1 POST /api/pilot-sqlite/hackathon-vote
  if (req.method === 'POST' && (pathname === '/api/activity/hackathon-vote' || pathname === '/api/pilot-sqlite/hackathon-vote')) {
    const body = await readJsonBody(req);
    const projectId = body.projectId;
    const newVotes = typeof body.newVoteCount === 'number' ? body.newVoteCount : 1;
    const now = new Date().toISOString();
    if (projectId) {
      await db.prepare('UPDATE pilot_hackathon_projects SET community_votes = ?, updated_at = ? WHERE id = ?').run(newVotes, now, projectId);
    }
    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true, projectId, newVotes, updatedAt: now }));
    return;
  }

  // 5.5 POST /api/pilot-sqlite/hackathon-reset
  if (req.method === 'POST' && (pathname === '/api/activity/hackathon-reset' || pathname === '/api/pilot-sqlite/hackathon-reset')) {
    const body = await readJsonBody(req);
    const province = body.province || '';
    let deletedCount = 0;
    if (province) {
      const info = await db.prepare('DELETE FROM pilot_hackathon_projects WHERE province = ?').run(province);
      deletedCount = Number(info.changes);
    } else {
      const info = await db.prepare('DELETE FROM pilot_hackathon_projects').run();
      deletedCount = Number(info.changes);
    }

    res.statusCode = 200;
    res.end(JSON.stringify({
      ok: true,
      message: `รีเซ็ตฐานข้อมูลโครงการ Hackathon เรียบร้อยแล้ว (ลบ ${deletedCount} โครงการใน SQLite)`,
      deletedCount,
      dbPath: 'PostgreSQL 16 (DB-MDC)', database: 'DB-MDC', engine: 'PostgreSQL 16'
    }));
    return;
  }

  // 5.5.0 POST /api/pilot-sqlite/project-delete
  if (req.method === 'POST' && (pathname === '/api/activity/project-delete' || pathname === '/api/pilot-sqlite/project-delete')) {
    const body = await readJsonBody(req);
    const projectId = body.id || body.projectId || '';
    if (!projectId) {
      res.statusCode = 400;
      res.end(JSON.stringify({ ok: false, error: 'Missing projectId' }));
      return;
    }
    const info = await db.prepare('DELETE FROM pilot_hackathon_projects WHERE id = ?').run(projectId);
    const deletedCount = Number(info.changes);
    res.statusCode = 200;
    res.end(JSON.stringify({
      ok: true,
      message: `ลบโครงการรหัส ${projectId} เรียบร้อยแล้ว (${deletedCount} แถวใน SQLite)`,
      deletedCount,
      id: projectId,
      dbPath: 'PostgreSQL 16 (DB-MDC)', database: 'DB-MDC', engine: 'PostgreSQL 16'
    }));
    return;
  }

  // 5.5.1 POST /api/pilot-sqlite/clear-activity-vote-system
  if (req.method === 'POST' && (pathname === '/api/activity/clear-activity-vote-system' || pathname === '/api/pilot-sqlite/clear-activity-vote-system')) {
    try {
      const delProj = Number(await db.prepare('DELETE FROM pilot_hackathon_projects').run().changes);
      const delCrit = Number(await db.prepare('DELETE FROM pilot_hackathon_criteria').run().changes);
      const delAgency = Number(await db.prepare('DELETE FROM pilot_agency_registrations').run().changes);
      const delLesson = Number(await db.prepare('DELETE FROM pilot_lessons_and_policies').run().changes);
      const totalDeleted = delProj + delCrit + delAgency + delLesson;

      res.statusCode = 200;
      res.end(JSON.stringify({
        ok: true,
        message: `ลบข้อมูลในตารางทั้งหมดของระบบกิจกรรมและการโหวตโครงการเรียบร้อยแล้ว (รวม ${totalDeleted} แถวใน SQLite)`,
        totalDeleted,
        deletedCounts: {
          pilot_hackathon_projects: delProj,
          pilot_hackathon_criteria: delCrit,
          pilot_agency_registrations: delAgency,
          pilot_lessons_and_policies: delLesson
        },
        dbPath: 'PostgreSQL 16 (DB-MDC)', database: 'DB-MDC', engine: 'PostgreSQL 16'
      }));
      return;
    } catch (err) {
      res.statusCode = 500;
      res.end(JSON.stringify({ ok: false, error: err?.message || 'Failed to clear activity vote tables' }));
      return;
    }
  }

  // 5.5.2 POST /api/pilot-sqlite/reset-registrations
  if (req.method === 'POST' && (pathname === '/api/activity/reset-registrations' || pathname === '/api/pilot-sqlite/reset-registrations')) {
    try {
      const province = urlObj.searchParams.get('province');
      let deletedCount = 0;
      if (province && province !== 'ALL') {
        const provList = (province === 'อยุธยา' || province === 'พระนครศรีอยุธยา') ? ['อยุธยา', 'พระนครศรีอยุธยา'] : [province];
        deletedCount = Number(await db.prepare(`DELETE FROM pilot_agency_registrations WHERE province IN (${provList.map(() => '?').join(',')})`).run(...provList).changes);
      } else {
        deletedCount = Number(await db.prepare('DELETE FROM pilot_agency_registrations').run().changes);
      }

      res.statusCode = 200;
      res.end(JSON.stringify({
        ok: true,
        message: province && province !== 'ALL'
          ? `ลบข้อมูลผู้ลงทะเบียนจังหวัด ${province} เรียบร้อยแล้ว (ลบ ${deletedCount} แถว)`
          : `ลบข้อมูลผู้ลงทะเบียนทั้งหมดเรียบร้อยแล้ว (ลบ ${deletedCount} แถว)`,
        deletedCount,
        province: province || 'ALL',
        dbPath: 'PostgreSQL 16 (DB-MDC)', database: 'DB-MDC', engine: 'PostgreSQL 16'
      }));
      return;
    } catch (err) {
      res.statusCode = 500;
      res.end(JSON.stringify({ ok: false, error: err?.message || 'Failed to reset registrations' }));
      return;
    }
  }

  // 5.6 GET /api/pilot-sqlite/tables
  if (req.method === 'GET' && (pathname === '/api/activity/tables' || pathname === '/api/pilot-sqlite/tables')) {
    try {
      let tables = [];
      if (db.isPg) {
        const tableRows = await db.all("SELECT table_name as name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name ASC");
        tables = await Promise.all(tableRows.map(async (t) => {
          let rowCount = 0;
          let columns = [];
          try {
            const c = await db.get(`SELECT COUNT(*) as count FROM "${t.name}"`);
            rowCount = Number(c?.count ?? 0);
          } catch {}
          try {
            const colInfo = await db.all("SELECT column_name as name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1", [t.name]);
            columns = colInfo.map(ci => ci.name);
          } catch {}
          return {
            name: t.name,
            rowCount,
            columnCount: columns.length,
            columns
          };
        }));
      } else {
        const tableRows = await db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name ASC");
        tables = await Promise.all(tableRows.map(async (t) => {
          let rowCount = 0;
          let columns = [];
          try {
            const c = await db.get(`SELECT COUNT(*) as count FROM "${t.name}"`);
            rowCount = Number(c?.count ?? 0);
          } catch {}
          try {
            const colInfo = await db.all(`PRAGMA table_info("${t.name}")`);
            columns = colInfo.map(ci => ci.name);
          } catch {}
          return {
            name: t.name,
            rowCount,
            columnCount: columns.length,
            columns
          };
        }));
      }

      res.statusCode = 200;
      res.end(JSON.stringify({
        ok: true,
        dbType: db.type,
        totalTables: tables.length,
        tables,
        dbPath: 'PostgreSQL 16 (DB-MDC)', database: 'DB-MDC', engine: 'PostgreSQL 16'
      }));
    } catch (err) {
      res.statusCode = 500;
      res.end(JSON.stringify({ ok: false, error: err?.message || 'Failed to list database tables' }));
    }
    return;
  }

  // 5.7 GET /api/pilot-sqlite/table-data
  if (req.method === 'GET' && (pathname === '/api/activity/table-data' || pathname === '/api/pilot-sqlite/table-data')) {
    const tableName = urlObj.searchParams.get('table') || '';
    if (!tableName || !/^[a-zA-Z0-9_]+$/.test(tableName)) {
      res.statusCode = 400;
      res.end(JSON.stringify({ ok: false, error: 'Invalid or missing table parameter' }));
      return;
    }

    try {
      let check = null;
      let columns = [];
      if (db.isPg) {
        check = await db.get("SELECT table_name as name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1", [tableName]);
        if (!check) {
          res.statusCode = 404;
          res.end(JSON.stringify({ ok: false, error: `Table '${tableName}' not found in PostgreSQL` }));
          return;
        }
        const colRows = await db.all("SELECT column_name as name, data_type as type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1", [tableName]);
        columns = colRows.map(c => ({ name: c.name, type: c.type }));
      } else {
        check = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name = ?", [tableName]);
        if (!check) {
          res.statusCode = 404;
          res.end(JSON.stringify({ ok: false, error: `Table '${tableName}' not found in SQLite` }));
          return;
        }
        columns = await db.all(`PRAGMA table_info("${tableName}")`);
      }

      const hasCreatedAt = columns.some(c => c.name === 'created_at');
      const orderClause = hasCreatedAt ? ' ORDER BY created_at DESC' : '';
      const rows = await db.all(`SELECT * FROM "${tableName}"${orderClause} LIMIT 1000`);

      res.statusCode = 200;
      res.end(JSON.stringify({
        ok: true,
        dbType: db.type,
        tableName,
        rowCount: rows.length,
        columns,
        rows,
        dbPath: 'PostgreSQL 16 (DB-MDC)', database: 'DB-MDC', engine: 'PostgreSQL 16'
      }));
    } catch (err) {
      res.statusCode = 500;
      res.end(JSON.stringify({ ok: false, error: err?.message || `Failed to read table ${tableName}` }));
    }
    return;
  }

  // 6. GET /api/duckdb/table?name=...
  if (req.method === 'GET' && pathname === '/api/duckdb/table') {
    const tableName = urlObj.searchParams.get('name') || '';
    const candidates = [
      path.resolve(distDir, 'duckdb_tables', `${tableName}.json`),
      path.resolve(distDir, 'data', 'duckdb_tables', `${tableName}.json`),
      path.resolve(cwd, 'public', 'duckdb_tables', `${tableName}.json`),
      path.resolve(cwd, 'public', 'data', 'duckdb_tables', `${tableName}.json`)
    ];
    const targetPath = candidates.find(p => fs.existsSync(p));

    if (tableName && targetPath) {
      const fileContent = fs.readFileSync(targetPath, 'utf8');
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(fileContent);
      return;
    } else {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: false, error: `DuckDB table ${tableName} not found` }));
      return;
    }
  }

  // 7. GET /api/duckdb/tables
  if (req.method === 'GET' && pathname === '/api/duckdb/tables') {
    const candidates = [
      path.resolve(distDir, 'duckdb_tables', 'index.json'),
      path.resolve(distDir, 'data', 'duckdb_tables', 'index.json'),
      path.resolve(cwd, 'public', 'duckdb_tables', 'index.json'),
      path.resolve(cwd, 'public', 'data', 'duckdb_tables', 'index.json')
    ];
    const targetIndex = candidates.find(p => fs.existsSync(p));

    if (targetIndex) {
      const fileContent = fs.readFileSync(targetIndex, 'utf8');
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(fileContent);
      return;
    }
  }

  res.statusCode = 404;
  res.end(JSON.stringify({ ok: false, error: 'Endpoint not found' }));
}

const server = http.createServer(async (req, res) => {
  try {
    const urlObj = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const pathname = decodeURIComponent(urlObj.pathname);

    if (pathname === '/api/health') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: true, status: 'healthy', database: db.dbName || 'DB-MDC', dbType: db.type, isPostgres: db.isPg, activityStorage: 'PostgreSQL 16 (DB-MDC)', sqliteDeprecatedForActivity: true, timestamp: new Date().toISOString() }));
      return;
    }

    if (
      pathname.startsWith('/api/activity') || pathname.startsWith('/api/pilot-sqlite') ||
      pathname.startsWith('/api/task-project') ||
      pathname.startsWith('/api/pms-report') ||
      pathname.startsWith('/api/duckdb')
    ) {
      await handleApiRequest(req, res, urlObj);
      return;
    }

    // Serve static files from dist/
    let safePath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, '');
    let filePath = path.join(distDir, safePath);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.statusCode = 200;
      res.setHeader('Content-Type', contentType);
      if (ext !== '.html') {
        res.setHeader('Cache-Control', 'public, max-age=86400');
      }
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    // SPA Fallback to dist/index.html
    const indexHtml = path.join(distDir, 'index.html');
    if (fs.existsSync(indexHtml)) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      fs.createReadStream(indexHtml).pipe(res);
      return;
    }

    res.statusCode = 404;
    res.end('Not Found');
  } catch (err) {
    console.error('Server error:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ ok: false, error: String(err?.message || err) }));
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Workshop Production Server] Listening on http://0.0.0.0:${PORT}`);
});
