import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

let pgPool = null;
let pgMdcPool = null;
let pgMdcStatus = 'disabled';

function getAdminPgConfig() {
  let adminConfig = {
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT || 5432),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '',
  };
  if (process.env.DATABASE_URL) {
    try {
      const u = new URL(process.env.DATABASE_URL);
      adminConfig = {
        host: u.hostname,
        port: Number(u.port || 5432),
        user: decodeURIComponent(u.username || 'postgres'),
        password: decodeURIComponent(u.password || ''),
      };
    } catch (e) {
      console.warn('[PostgreSQL] Could not parse DATABASE_URL:', e.message);
    }
  }
  return adminConfig;
}

function getMdcPoolConfig() {
  const adminConfig = getAdminPgConfig();
  if (process.env.DATABASE_URL) {
    try {
      const u = new URL(process.env.DATABASE_URL);
      u.pathname = '/DB-MDC';
      return {
        connectionString: u.toString(),
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
        max: 20,
      };
    } catch {}
  }
  return {
    ...adminConfig,
    database: 'DB-MDC',
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    max: 20,
  };
}

async function ensurePostgresDatabase(pgModule, targetDbName) {
  const { Client } = pgModule.default || pgModule;
  const adminConfig = getAdminPgConfig();
  const candidateDbs = ['postgres', 'mdc_synergy', 'template1'];
  let client = null;

  for (const candidate of candidateDbs) {
    try {
      client = new Client({
        ...adminConfig,
        database: candidate,
        connectionTimeoutMillis: 5000,
      });
      await client.connect();
      console.log(`[PostgreSQL] Connected to maintenance database "${candidate}"`);
      break;
    } catch (err) {
      if (client) {
        try { await client.end(); } catch {}
        client = null;
      }
    }
  }

  if (!client) {
    console.warn(`[PostgreSQL] Could not connect to any maintenance DB (${candidateDbs.join(', ')}) to verify/create "${targetDbName}"`);
    return false;
  }

  try {
    const res = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [targetDbName]);
    if (res.rows.length === 0) {
      console.log(`[PostgreSQL] Database "${targetDbName}" does not exist. Creating database "${targetDbName}"...`);
      const safeDbName = targetDbName.replace(/"/g, '""');
      await client.query(`CREATE DATABASE "${safeDbName}"`);
      console.log(`[PostgreSQL] Successfully created database "${targetDbName}"!`);
    } else {
      console.log(`[PostgreSQL] Database "${targetDbName}" already exists.`);
    }
    return true;
  } catch (err) {
    console.warn(`[PostgreSQL] Error in ensurePostgresDatabase for "${targetDbName}":`, err.message);
    return false;
  } finally {
    try {
      await client.end();
    } catch {}
  }
}

async function initMdcTables(pool) {
  console.log('[PostgreSQL] Initializing activity tables in "DB-MDC"...');
  await pool.query(`
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

    CREATE TABLE IF NOT EXISTS central_dataset_pool (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT DEFAULT 'external_agency',
      domain_id TEXT DEFAULT 'moral-index',
      source_type TEXT DEFAULT 'CSV/Excel',
      source_agency TEXT DEFAULT 'หน่วยงานภายนอก',
      source_website TEXT DEFAULT '',
      row_count INTEGER DEFAULT 0,
      column_count INTEGER DEFAULT 0,
      columns_json TEXT,
      raw_data_json TEXT,
      cleansed_data_json TEXT,
      is_cleansed INTEGER DEFAULT 0,
      is_ready_for_synergy INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS api_sync_schedules (
      id TEXT PRIMARY KEY,
      dataset_id TEXT NOT NULL,
      dataset_name TEXT NOT NULL,
      endpoint_url TEXT NOT NULL,
      http_method TEXT DEFAULT 'GET',
      headers_json TEXT,
      schedule_type TEXT DEFAULT 'daily',
      schedule_time TEXT DEFAULT '02:00',
      schedule_days_json TEXT DEFAULT '["monday","thursday"]',
      custom_dates_json TEXT DEFAULT '[]',
      is_active INTEGER DEFAULT 1,
      last_run_at TEXT,
      last_status TEXT DEFAULT 'pending',
      last_message TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS dataset_transformation_logs (
      id TEXT PRIMARY KEY,
      dataset_id TEXT NOT NULL,
      dataset_name TEXT,
      timestamp TEXT NOT NULL,
      triggered_by TEXT DEFAULT 'manual_action',
      province_normalization_count INTEGER DEFAULT 0,
      year_alignment_info TEXT,
      sanitized_values_count INTEGER DEFAULT 0,
      deduplicated_rows_count INTEGER DEFAULT 0,
      log_summary_json TEXT,
      status TEXT DEFAULT 'completed'
    );

    CREATE TABLE IF NOT EXISTS synergy_initiatives_registry (
      id TEXT PRIMARY KEY,
      domain_id TEXT NOT NULL,
      dimension_id TEXT NOT NULL,
      title TEXT NOT NULL,
      internal_table_id TEXT,
      external_table_id TEXT,
      compatibility_score REAL DEFAULT 0,
      compatibility_dimensions_json TEXT,
      is_published_to_main INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_notification_settings (
      id TEXT PRIMARY KEY,
      line_notify_token TEXT,
      email_recipients TEXT,
      notify_on_api_success INTEGER DEFAULT 1,
      notify_on_api_error INTEGER DEFAULT 1,
      updated_at TEXT NOT NULL
    );
  `);
  console.log('[PostgreSQL] Tables in "DB-MDC" are ready!');

  // Seed coffee groups if table is empty
  const grpCountRes = await pool.query('SELECT COUNT(*) as cnt FROM pilot_coffee_groups');
  if (Number(grpCountRes.rows[0]?.cnt || 0) === 0) {
    console.log('[PostgreSQL] Seeding default coffee groups into DB-MDC...');
    let seedGroups = [
      { key: 'mocha', name: 'กลุ่มมอคค่า', bg_image: '/theme/coffee_mocha_bg.jpg', theme_color: '#78350f', accent_bg: '#fef3c7', is_custom: 0, order_index: 1 },
      { key: 'cappuccino', name: 'กลุ่มคาปูชิโน', bg_image: '/theme/coffee_cappuccino_bg.jpg', theme_color: '#92400e', accent_bg: '#ffedd5', is_custom: 0, order_index: 2 },
      { key: 'americano', name: 'กลุ่มอเมริกาโน', bg_image: '/theme/coffee_americano_bg.jpg', theme_color: '#1c1917', accent_bg: '#f5f5f4', is_custom: 0, order_index: 3 },
      { key: 'espresso', name: 'กลุ่มเอสเพรสโซ', bg_image: '/theme/coffee_preset_05_espresso.jpg', theme_color: '#451a03', accent_bg: '#fef2f2', is_custom: 0, order_index: 4 },
      { key: 'latte', name: 'กลุ่มลาเต้', bg_image: '/theme/coffee_preset_06_latte.jpg', theme_color: '#b45309', accent_bg: '#fffbeb', is_custom: 0, order_index: 5 }
    ];

    if (fs.existsSync(coffeeGroupsFile)) {
      try {
        const fileContent = JSON.parse(fs.readFileSync(coffeeGroupsFile, 'utf8'));
        if (Array.isArray(fileContent) && fileContent.length > 0) {
          seedGroups = fileContent.map((g, idx) => ({
            key: g.key,
            name: g.name,
            bg_image: g.bgImage || g.bg_image || '/theme/coffee_preset_01_beans.jpg',
            theme_color: g.themeColor || g.theme_color || '#78350f',
            accent_bg: g.accentBg || g.accent_bg || '#fef3c7',
            is_custom: g.isCustom ? 1 : 0,
            order_index: typeof g.orderIndex === 'number' ? g.orderIndex : idx + 1
          }));
        }
      } catch (e) {
        console.warn('[PostgreSQL] Failed parsing coffeeGroupsFile for seed:', e.message);
      }
    }

    const now = new Date().toISOString();
    for (const g of seedGroups) {
      await pool.query(
        `INSERT INTO pilot_coffee_groups (key, name, bg_image, theme_color, accent_bg, is_custom, order_index, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (key) DO NOTHING`,
        [g.key, g.name, g.bg_image, g.theme_color, g.accent_bg, g.is_custom, g.order_index, now, now]
      );
    }
  }

  // Seed AI config if table is empty
  const aiCountRes = await pool.query('SELECT COUNT(*) as cnt FROM pilot_ai_config');
  if (Number(aiCountRes.rows[0]?.cnt || 0) === 0 && fs.existsSync(aiConfigFile)) {
    try {
      const parsedCfg = JSON.parse(fs.readFileSync(aiConfigFile, 'utf8'));
      if (parsedCfg && parsedCfg.apiKey) {
        const now = new Date().toISOString();
        await pool.query(
          `INSERT INTO pilot_ai_config (id, api_key, model, system_prompt, generator_prompt, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO NOTHING`,
          ['default', parsedCfg.apiKey, parsedCfg.model || 'openai/gpt-4o-mini', parsedCfg.systemPrompt || '', parsedCfg.generatorPrompt || '', now]
        );
      }
    } catch (e) {
      console.warn('[PostgreSQL] Failed seeding ai_config to DB-MDC:', e.message);
    }
  }

  // Sync initial registrations & projects from SQLite to DB-MDC if DB-MDC is empty
  try {
    const regCountRes = await pool.query('SELECT COUNT(*) as cnt FROM pilot_agency_registrations');
    if (Number(regCountRes.rows[0]?.cnt || 0) === 0) {
      const sqliteRegs = db.prepare('SELECT * FROM pilot_agency_registrations').all();
      if (sqliteRegs.length > 0) {
        console.log(`[PostgreSQL] Migrating ${sqliteRegs.length} agency registrations from SQLite to DB-MDC...`);
        for (const r of sqliteRegs) {
          await pool.query(`
            INSERT INTO pilot_agency_registrations (
              id, province, region, agency_name, agency_type,
              first_name, last_name, position, participant_level,
              coordinator_name, participant_role, district, subdistrict,
              phone, email, contact_info, coffee_group,
              trial_project_name, trial_project_summary, activity_date, synergy_topic,
              uploaded_files_json, extracted_data_preview, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
            ON CONFLICT (id) DO NOTHING
          `, [
            r.id, r.province, r.region, r.agency_name, r.agency_type,
            r.first_name, r.last_name, r.position, r.participant_level,
            r.coordinator_name, r.participant_role, r.district, r.subdistrict,
            r.phone, r.email, r.contact_info, r.coffee_group,
            r.trial_project_name, r.trial_project_summary, r.activity_date, r.synergy_topic,
            r.uploaded_files_json, r.extracted_data_preview, r.created_at
          ]);
        }
      }
    }

    const projCountRes = await pool.query('SELECT COUNT(*) as cnt FROM pilot_hackathon_projects');
    if (Number(projCountRes.rows[0]?.cnt || 0) === 0) {
      const sqliteProjs = db.prepare('SELECT * FROM pilot_hackathon_projects').all();
      if (sqliteProjs.length > 0) {
        console.log(`[PostgreSQL] Migrating ${sqliteProjs.length} hackathon projects from SQLite to DB-MDC...`);
        for (const p of sqliteProjs) {
          await pool.query(`
            INSERT INTO pilot_hackathon_projects (
              id, province, group_key, group_name, project_name, target_moral_virtue,
              target_audience, target_area, proposal_details, activity_plan, behavioral_kpi,
              proposer_name, proposer_agency, proposer_position, proposer_level, challenge_topic,
              evaluated_criteria_virtues_json, ai_score, ai_score_breakdown_json, ai_recommendations,
              community_votes, is_precheck, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
            ON CONFLICT (id) DO NOTHING
          `, [
            p.id, p.province, p.group_key, p.group_name, p.project_name, p.target_moral_virtue,
            p.target_audience, p.target_area, p.proposal_details, p.activity_plan, p.behavioral_kpi,
            p.proposer_name, p.proposer_agency, p.proposer_position || '', p.proposer_level, p.challenge_topic,
            p.evaluated_criteria_virtues_json, p.ai_score, p.ai_score_breakdown_json, p.ai_recommendations,
            p.community_votes || 0, p.is_precheck || 0, p.created_at, p.updated_at
          ]);
        }
      }
    }

    const critCountRes = await pool.query('SELECT COUNT(*) as cnt FROM pilot_hackathon_criteria');
    if (Number(critCountRes.rows[0]?.cnt || 0) === 0) {
      const sqliteCrits = db.prepare('SELECT * FROM pilot_hackathon_criteria').all();
      for (const c of sqliteCrits) {
        await pool.query(`
          INSERT INTO pilot_hackathon_criteria (id, province, created_at, updated_at, source_files_json, ai_agent_skill_text, rubric_json, prompt_skill, prompt_rubric, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (id) DO NOTHING
        `, [c.id, c.province, c.created_at, c.updated_at, c.source_files_json, c.ai_agent_skill_text, c.rubric_json, c.prompt_skill, c.prompt_rubric, c.is_active]);
      }
    }
  } catch (err) {
    console.warn('[PostgreSQL] SQLite to DB-MDC migration notice:', err.message);
  }
}

async function initPostgresMdc() {
  if (!process.env.DATABASE_URL && !process.env.PGHOST) {
    console.log('[PostgreSQL] No DATABASE_URL or PGHOST provided. Activity endpoints will use SQLite fallback.');
    return;
  }

  try {
    const pgModule = await import('pg').catch(() => null);
    if (!pgModule) {
      console.warn('[PostgreSQL] Package "pg" not available; skipping PostgreSQL');
      return;
    }
    const { Pool: PgPool } = pgModule.default || pgModule;

    // 1. Ensure database "DB-MDC" exists on PostgreSQL server
    await ensurePostgresDatabase(pgModule, 'DB-MDC');

    // 2. Initialize connection pool to "DB-MDC"
    const mdcConfig = getMdcPoolConfig();
    pgMdcPool = new PgPool(mdcConfig);
    pgMdcPool.on('error', (err) => {
      console.error('[PostgreSQL] DB-MDC Pool background error:', err.message);
    });

    // 3. Verify connection to "DB-MDC"
    const client = await pgMdcPool.connect();
    const verRes = await client.query('SELECT current_database() as db, NOW() as now');
    client.release();
    const currentDb = verRes.rows[0]?.db;
    pgMdcStatus = `connected (db: ${currentDb})`;
    console.log(`[PostgreSQL] Connected successfully to database "${currentDb}" at ${verRes.rows[0]?.now}`);

    // 4. Create all activity tables and seed DB-MDC
    await initMdcTables(pgMdcPool);
  } catch (err) {
    console.error('[PostgreSQL] Failed to initialize DB-MDC pool:', err.message);
    pgMdcStatus = `error: ${err.message}`;
    pgMdcPool = null;
  }
}

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

const db = new DatabaseSync(dbPath);
try {
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA busy_timeout = 5000;');
} catch {
  // ignore pragma error
}

db.exec(`
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

  CREATE TABLE IF NOT EXISTS central_dataset_pool (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'external_agency',
    domain_id TEXT DEFAULT 'moral-index',
    source_type TEXT DEFAULT 'CSV/Excel',
    source_agency TEXT DEFAULT 'หน่วยงานภายนอก',
    source_website TEXT DEFAULT '',
    row_count INTEGER DEFAULT 0,
    column_count INTEGER DEFAULT 0,
    columns_json TEXT,
    raw_data_json TEXT,
    cleansed_data_json TEXT,
    is_cleansed INTEGER DEFAULT 0,
    is_ready_for_synergy INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS api_sync_schedules (
    id TEXT PRIMARY KEY,
    dataset_id TEXT NOT NULL,
    dataset_name TEXT NOT NULL,
    endpoint_url TEXT NOT NULL,
    http_method TEXT DEFAULT 'GET',
    headers_json TEXT,
    schedule_type TEXT DEFAULT 'daily',
    schedule_time TEXT DEFAULT '02:00',
    schedule_days_json TEXT DEFAULT '["monday","thursday"]',
    custom_dates_json TEXT DEFAULT '[]',
    is_active INTEGER DEFAULT 1,
    last_run_at TEXT,
    last_status TEXT DEFAULT 'pending',
    last_message TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS dataset_transformation_logs (
    id TEXT PRIMARY KEY,
    dataset_id TEXT NOT NULL,
    dataset_name TEXT,
    timestamp TEXT NOT NULL,
    triggered_by TEXT DEFAULT 'manual_action',
    province_normalization_count INTEGER DEFAULT 0,
    year_alignment_info TEXT,
    sanitized_values_count INTEGER DEFAULT 0,
    deduplicated_rows_count INTEGER DEFAULT 0,
    log_summary_json TEXT,
    status TEXT DEFAULT 'completed'
  );

  CREATE TABLE IF NOT EXISTS synergy_initiatives_registry (
    id TEXT PRIMARY KEY,
    domain_id TEXT NOT NULL,
    dimension_id TEXT NOT NULL,
    title TEXT NOT NULL,
    internal_table_id TEXT,
    external_table_id TEXT,
    compatibility_score REAL DEFAULT 0,
    compatibility_dimensions_json TEXT,
    is_published_to_main INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS admin_notification_settings (
    id TEXT PRIMARY KEY,
    line_notify_token TEXT,
    email_recipients TEXT,
    notify_on_api_success INTEGER DEFAULT 1,
    notify_on_api_error INTEGER DEFAULT 1,
    updated_at TEXT NOT NULL
  );
`);

try {
  db.prepare("ALTER TABLE central_dataset_pool ADD COLUMN source_website TEXT DEFAULT '';").run();
} catch (e) {}

// Seed default external datasets if table is empty
try {
  const centralSeedFile = path.resolve(process.cwd(), 'data/central_datasets_seed.json');
  if (fs.existsSync(centralSeedFile)) {
    const rawSeeds = JSON.parse(fs.readFileSync(centralSeedFile, 'utf8'));
    const now = new Date().toISOString();
    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO central_dataset_pool
      (id, name, category, domain_id, source_type, source_agency, source_website, row_count, column_count, columns_json, raw_data_json, cleansed_data_json, is_cleansed, is_ready_for_synergy, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const s of rawSeeds) {
      insertStmt.run(
        s.id,
        s.name,
        s.category,
        s.domain_id || 'moral-index',
        s.source_type,
        s.source_agency,
        s.source_website || '',
        s.row_count,
        s.column_count,
        s.columns_json,
        s.raw_data_json,
        s.cleansed_data_json,
        s.is_cleansed,
        s.is_ready_for_synergy,
        s.created_at || now,
        s.updated_at || now
      );
    }
  }
} catch (err) {
  console.warn('Bootstrap central_dataset_pool from seed error:', err);
}

// Bootstrap AI config from disk file data/ai_config.json if table is empty
try {
  const existingAiRow = db.prepare('SELECT * FROM pilot_ai_config WHERE id = ?').get('default');
  if (!existingAiRow && fs.existsSync(aiConfigFile)) {
    const rawCfg = fs.readFileSync(aiConfigFile, 'utf8');
    const parsedCfg = JSON.parse(rawCfg);
    if (parsedCfg && parsedCfg.apiKey) {
      const nowStr = new Date().toISOString();
      db.prepare(`
        INSERT OR REPLACE INTO pilot_ai_config (id, api_key, model, system_prompt, generator_prompt, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run('default', parsedCfg.apiKey, parsedCfg.model || 'openai/gpt-4o-mini', parsedCfg.systemPrompt || '', parsedCfg.generatorPrompt || '', nowStr);
    }
  } else if (existingAiRow && existingAiRow.api_key && !fs.existsSync(aiConfigFile)) {
    fs.writeFileSync(aiConfigFile, JSON.stringify({
      apiKey: existingAiRow.api_key,
      model: existingAiRow.model || 'openai/gpt-4o-mini',
      systemPrompt: existingAiRow.system_prompt || '',
      generatorPrompt: existingAiRow.generator_prompt || '',
      updatedAt: existingAiRow.updated_at
    }, null, 2), 'utf8');
  }
} catch (err) {
  console.warn('Bootstrap AI config check error:', err);
}

// Bootstrap Coffee Groups in SQLite if table is empty
try {
  const existingGroupCount = db.prepare('SELECT COUNT(*) as cnt FROM pilot_coffee_groups').get()?.cnt || 0;
  if (existingGroupCount === 0) {
    let seedGroups = [
      { key: 'mocha', name: 'กลุ่มมอคค่า', bg_image: '/theme/coffee_mocha_bg.jpg', theme_color: '#78350f', accent_bg: '#fef3c7', is_custom: 0, order_index: 1 },
      { key: 'cappuccino', name: 'กลุ่มคาปูชิโน', bg_image: '/theme/coffee_cappuccino_bg.jpg', theme_color: '#92400e', accent_bg: '#ffedd5', is_custom: 0, order_index: 2 },
      { key: 'americano', name: 'กลุ่มอเมริกาโน', bg_image: '/theme/coffee_americano_bg.jpg', theme_color: '#1c1917', accent_bg: '#f5f5f4', is_custom: 0, order_index: 3 },
      { key: 'espresso', name: 'กลุ่มเอสเพรสโซ', bg_image: '/theme/coffee_preset_05_espresso.jpg', theme_color: '#451a03', accent_bg: '#fef2f2', is_custom: 0, order_index: 4 },
      { key: 'latte', name: 'กลุ่มลาเต้', bg_image: '/theme/coffee_preset_06_latte.jpg', theme_color: '#b45309', accent_bg: '#fffbeb', is_custom: 0, order_index: 5 }
    ];

    if (fs.existsSync(coffeeGroupsFile)) {
      try {
        const fileContent = JSON.parse(fs.readFileSync(coffeeGroupsFile, 'utf8'));
        if (Array.isArray(fileContent) && fileContent.length > 0) {
          seedGroups = fileContent.map((g, idx) => ({
            key: g.key,
            name: g.name,
            bg_image: g.bgImage || g.bg_image || '/theme/coffee_preset_01_beans.jpg',
            theme_color: g.themeColor || g.theme_color || '#78350f',
            accent_bg: g.accentBg || g.accent_bg || '#fef3c7',
            is_custom: g.isCustom ? 1 : 0,
            order_index: typeof g.orderIndex === 'number' ? g.orderIndex : idx + 1
          }));
        }
      } catch (e) {
        console.warn('Failed parsing coffeeGroupsFile:', e);
      }
    }

    const now = new Date().toISOString();
    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO pilot_coffee_groups 
      (key, name, bg_image, theme_color, accent_bg, is_custom, order_index, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const g of seedGroups) {
      insertStmt.run(g.key, g.name, g.bg_image, g.theme_color, g.accent_bg, g.is_custom, g.order_index, now, now);
    }
  } else if (!fs.existsSync(coffeeGroupsFile)) {
    const rows = db.prepare('SELECT * FROM pilot_coffee_groups ORDER BY order_index ASC, created_at ASC').all();
    const groups = rows.map(r => ({
      key: r.key,
      name: r.name,
      bgImage: r.bg_image,
      themeColor: r.theme_color,
      accentBg: r.accent_bg,
      isCustom: Boolean(r.is_custom)
    }));
    fs.writeFileSync(coffeeGroupsFile, JSON.stringify(groups, null, 2), 'utf8');
  }
} catch (err) {
  console.warn('Bootstrap coffee groups error:', err);
}

try { db.exec('ALTER TABLE pilot_agency_registrations ADD COLUMN first_name TEXT;'); } catch {}
try { db.exec('ALTER TABLE pilot_agency_registrations ADD COLUMN last_name TEXT;'); } catch {}
try { db.exec('ALTER TABLE pilot_agency_registrations ADD COLUMN position TEXT;'); } catch {}
try { db.exec('ALTER TABLE pilot_agency_registrations ADD COLUMN participant_level TEXT;'); } catch {}
try { db.exec('ALTER TABLE pilot_agency_registrations ADD COLUMN phone TEXT;'); } catch {}
try { db.exec('ALTER TABLE pilot_agency_registrations ADD COLUMN email TEXT;'); } catch {}
try { db.exec('ALTER TABLE pilot_agency_registrations ADD COLUMN coffee_group TEXT;'); } catch {}
try { db.exec('ALTER TABLE pilot_agency_registrations ADD COLUMN participant_role TEXT;'); } catch {}
try { db.exec('ALTER TABLE pilot_agency_registrations ADD COLUMN district TEXT;'); } catch {}
try { db.exec('ALTER TABLE pilot_agency_registrations ADD COLUMN subdistrict TEXT;'); } catch {}
try { db.exec('ALTER TABLE pilot_hackathon_projects ADD COLUMN proposer_position TEXT;'); } catch {}

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

// --------------------------------------------------------------------------
// ADMIN NOTIFICATION HELPER (LINE NOTIFY / WEBHOOK & EMAIL)
// --------------------------------------------------------------------------
async function sendAdminAlertNotification(subject, message) {
  let settings;
  try {
    if (pgMdcPool) {
      settings = (await pgMdcPool.query("SELECT * FROM admin_notification_settings WHERE id = 'default'")).rows[0];
    } else {
      settings = db.prepare("SELECT * FROM admin_notification_settings WHERE id = 'default'").get();
    }
  } catch {}

  const results = { line: null, email: null };
  const lineToken = settings?.line_notify_token?.trim();
  const emailList = settings?.email_recipients?.trim();

  // 1. Send via LINE Notify or LINE Webhook if configured
  if (lineToken) {
    try {
      if (lineToken.startsWith('http://') || lineToken.startsWith('https://')) {
        const lineRes = await fetch(lineToken, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: `[${subject}]\n${message}` })
        });
        results.line = { success: lineRes.ok, status: lineRes.status };
      } else {
        const params = new URLSearchParams();
        params.append('message', `\n${subject}\n${message}`);
        const lineRes = await fetch('https://notify-api.line.me/api/notify', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lineToken}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params.toString()
        });
        results.line = { success: lineRes.ok, status: lineRes.status };
      }
    } catch (e) {
      results.line = { success: false, error: e.message };
    }
  } else {
    results.line = { simulated: true, note: 'No LINE Token configured; simulation logged to console' };
    console.log(`[Notification: LINE Simulated] ${subject}\n${message}`);
  }

  // 2. Email dispatch simulation / log
  if (emailList) {
    results.email = { success: true, recipients: emailList, simulated: true, note: 'Email dispatch recorded' };
    console.log(`[Notification: Email Dispatch to ${emailList}] ${subject}\n${message}`);
  } else {
    results.email = { simulated: true, note: 'No email recipients configured' };
  }

  return results;
}

// --------------------------------------------------------------------------
// API SCHEDULER SYNC JOB EXECUTOR
// --------------------------------------------------------------------------
async function executeApiSyncJob(sched) {
  const now = new Date().toISOString();
  try {
    console.log(`[API Scheduler] Executing sync for "${sched.dataset_name}" (${sched.endpoint_url})...`);

    let headers = { 'Accept': 'application/json' };
    if (sched.headers_json) {
      try {
        const parsedH = JSON.parse(sched.headers_json);
        headers = { ...headers, ...parsedH };
      } catch {}
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const apiRes = await fetch(sched.endpoint_url, {
      method: sched.http_method || 'GET',
      headers,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!apiRes.ok) {
      throw new Error(`HTTP Error: ${apiRes.status} ${apiRes.statusText}`);
    }

    const json = await apiRes.json();
    let rows = [];
    if (Array.isArray(json)) {
      rows = json;
    } else if (json && typeof json === 'object') {
      const arrProp = Object.values(json).find(v => Array.isArray(v));
      rows = arrProp || [json];
    }

    const rowCount = rows.length;
    const columns = rows.length > 0 && typeof rows[0] === 'object' && rows[0] !== null
      ? Object.keys(rows[0]).map(k => ({ name: k, type: typeof rows[0][k] }))
      : [];
    const columnCount = columns.length;

    const datasetId = sched.dataset_id;
    const datasetName = sched.dataset_name;
    const columnsJson = JSON.stringify(columns);
    const rawDataJson = JSON.stringify(rows);

    if (pgMdcPool) {
      await pgMdcPool.query(`
        INSERT INTO central_dataset_pool 
        (id, name, category, domain_id, source_type, source_agency, row_count, column_count, columns_json, raw_data_json, is_cleansed, is_ready_for_synergy, created_at, updated_at)
        VALUES ($1, $2, 'external_agency', 'moral-index', 'API Service', 'API External Ingestion', $3, $4, $5, $6, 0, 0, $7, $8)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          row_count = EXCLUDED.row_count,
          column_count = EXCLUDED.column_count,
          columns_json = EXCLUDED.columns_json,
          raw_data_json = EXCLUDED.raw_data_json,
          is_cleansed = 0,
          is_ready_for_synergy = 0,
          updated_at = EXCLUDED.updated_at
      `, [datasetId, datasetName, rowCount, columnCount, columnsJson, rawDataJson, now, now]);

      await pgMdcPool.query(`
        UPDATE api_sync_schedules 
        SET last_run_at = $1, last_status = 'success', last_message = $2, updated_at = $3
        WHERE id = $4
      `, [now, `ดึงข้อมูลสำเร็จ ${rowCount} รายการ`, now, sched.id]);
    } else {
      db.prepare(`
        INSERT OR REPLACE INTO central_dataset_pool 
        (id, name, category, domain_id, source_type, source_agency, row_count, column_count, columns_json, raw_data_json, is_cleansed, is_ready_for_synergy, created_at, updated_at)
        VALUES (?, ?, 'external_agency', 'moral-index', 'API Service', 'API External Ingestion', ?, ?, ?, ?, 0, 0, COALESCE((SELECT created_at FROM central_dataset_pool WHERE id = ?), ?), ?)
      `).run(datasetId, datasetName, rowCount, columnCount, columnsJson, rawDataJson, datasetId, now, now);

      db.prepare(`
        UPDATE api_sync_schedules 
        SET last_run_at = ?, last_status = 'success', last_message = ?, updated_at = ?
        WHERE id = ?
      `).run(now, `ดึงข้อมูลสำเร็จ ${rowCount} รายการ`, now, sched.id);
    }

    const logId = `log_${Date.now()}`;
    const logSummary = [
      `ดึงข้อมูลผ่าน API Service สำเร็จ: ${sched.endpoint_url}`,
      `จำนวนแถวข้อมูลดิบที่ได้รับ: ${rowCount} แถว (${columnCount} คอลัมน์)`,
      `บันทึกเข้าคลังข้อมูลกลาง (Central Pool) เรียบร้อยแล้ว (รอการตรวจสอบและ Cleansing ข้อมูล)`
    ];
    if (pgMdcPool) {
      await pgMdcPool.query(`
        INSERT INTO dataset_transformation_logs 
        (id, dataset_id, dataset_name, timestamp, triggered_by, log_summary_json, status)
        VALUES ($1, $2, $3, $4, 'api_sync', $5, 'completed')
      `, [logId, datasetId, datasetName, now, JSON.stringify(logSummary)]);
    } else {
      db.prepare(`
        INSERT INTO dataset_transformation_logs 
        (id, dataset_id, dataset_name, timestamp, triggered_by, log_summary_json, status)
        VALUES (?, ?, ?, ?, 'api_sync', ?, 'completed')
      `).run(logId, datasetId, datasetName, now, JSON.stringify(logSummary));
    }

    await sendAdminAlertNotification(
      `🔔 [MDC Dataset Alert] ดึงข้อมูล API สำเร็จ: "${datasetName}"`,
      `ระบบได้ทำการดึงข้อมูลตามรอบเวลาอัตโนมัติสำเร็จแล้ว\nชุดข้อมูล: ${datasetName}\nจำนวน: ${rowCount} แถว\nวัน-เวลา: ${now}\nกรุณาเข้าสู่ระบบหน้า Admin Dataset เพื่อตรวจสอบความถูกต้องและดำเนินการทำ Cleansing ข้อมูลต่อไป`
    );

    return { success: true, rowCount, columnCount, timestamp: now };
  } catch (err) {
    console.error(`[API Scheduler Error] ${sched.dataset_name}:`, err.message);
    const failMsg = `เกิดข้อผิดพลาด: ${err.message}`;
    if (pgMdcPool) {
      await pgMdcPool.query(`
        UPDATE api_sync_schedules 
        SET last_run_at = $1, last_status = 'failed', last_message = $2, updated_at = $3
        WHERE id = $4
      `, [now, failMsg, now, sched.id]);
    } else {
      db.prepare(`
        UPDATE api_sync_schedules 
        SET last_run_at = ?, last_status = 'failed', last_message = ?, updated_at = ?
        WHERE id = ?
      `).run(now, failMsg, now, sched.id);
    }

    await sendAdminAlertNotification(
      `⚠️ [MDC Dataset Alert] ดึงข้อมูล API ล้มเหลว: "${sched.dataset_name}"`,
      `ระบบไม่สามารถดึงข้อมูลตามรอบเวลาได้\nสาเหตุ: ${err.message}\nEndpoint: ${sched.endpoint_url}\nกรุณาตรวจสอบการตั้งค่า API ในหน้า Admin Dataset`
    );

    throw err;
  }
}

// --------------------------------------------------------------------------
// BACKGROUND CRON RUNNER (CHECK SCHEDULES EVERY 60 SECONDS)
// --------------------------------------------------------------------------
setInterval(async () => {
  try {
    let schedules = [];
    if (pgMdcPool) {
      schedules = (await pgMdcPool.query('SELECT * FROM api_sync_schedules WHERE is_active = 1')).rows;
    } else {
      schedules = db.prepare('SELECT * FROM api_sync_schedules WHERE is_active = 1').all();
    }

    if (!schedules || schedules.length === 0) return;

    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMinutes}`;
    const daysMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = daysMap[now.getDay()];
    const currentDateStr = now.toISOString().slice(0, 10);

    for (const sched of schedules) {
      const schedTime = sched.schedule_time || '02:00';
      if (schedTime !== currentTimeStr) continue;

      if (sched.last_run_at && sched.last_run_at.slice(0, 10) === currentDateStr && sched.last_run_at.slice(11, 16) === currentTimeStr) {
        continue;
      }

      let shouldRun = false;
      if (sched.schedule_type === 'daily') {
        shouldRun = true;
      } else if (sched.schedule_type === 'weekly') {
        try {
          const days = JSON.parse(sched.schedule_days_json || '[]');
          if (Array.isArray(days) && days.includes(currentDay)) {
            shouldRun = true;
          }
        } catch {}
      } else if (sched.schedule_type === 'custom_calendar') {
        try {
          const dates = JSON.parse(sched.custom_dates_json || '[]');
          if (Array.isArray(dates) && dates.some(d => d.startsWith(currentDateStr))) {
            shouldRun = true;
          }
        } catch {}
      }

      if (shouldRun) {
        executeApiSyncJob(sched).catch(() => {});
      }
    }
  } catch (err) {}
}, 60000);

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
      const allRows = db.prepare('SELECT * FROM task_project ORDER BY project_id, phase_no, start_date').all();

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
      const tasks = db.prepare('SELECT * FROM task_project WHERE project_id = ? ORDER BY phase_no, start_date').all(projectId);
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
      db.prepare('DELETE FROM task_project WHERE project_id = ?').run(projectId);

      const insertStmt = db.prepare(`
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
        insertStmt.run(
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
      const updateStmt = db.prepare(`
        UPDATE task_project 
        SET status = ?, progress_percent = ?, last_meeting_id = ?, last_meeting_notes = ?, updated_by_meeting_at = ?, updated_at = ?
        WHERE id = ?
      `);

      let count = 0;
      for (const u of updates) {
        if (u.id) {
          updateStmt.run(
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
      const insertStmt = db.prepare(`
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
        insertStmt.run(
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
        db.prepare('DELETE FROM task_project WHERE project_id = ?').run(projectId);
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
      const reports = db.prepare('SELECT * FROM pms_meeting_reports ORDER BY meeting_date DESC, created_at DESC').all();
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
      const reports = db.prepare('SELECT * FROM pms_meeting_reports WHERE project_id = ? ORDER BY meeting_date DESC, created_at DESC').all(projectId);
      res.statusCode = 200;
      res.end(JSON.stringify({ ok: true, reports }));
      return;
    }

    if (req.method === 'POST' && pathname === '/api/pms-report/save') {
      const p = await readJsonBody(req);
      const id = p.id || `REP02-${p.meetingId || Date.now()}`;
      const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

      const stmt = db.prepare(`
        INSERT OR REPLACE INTO pms_meeting_reports (
          id, meeting_id, project_id, project_name, province,
          meeting_date, meeting_topic, reporting_period, executive_summary,
          source_file_name, obstacles_and_risks, corrective_solutions,
          updated_tasks_json, added_tasks_json, directives_json,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
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

  // 0. GET /api/pilot-sqlite/sync-status (and /api/pilot-postgres/sync-status)
  // Lightweight background sync endpoint for multi-user real-time updates (Step 2 Groups & Step 5 Projects & Step 1 Registrations)
  if (req.method === 'GET' && (pathname === '/api/pilot-sqlite/sync-status' || pathname === '/api/pilot-postgres/sync-status')) {
    const rawProvince = (urlObj.searchParams.get('province') || '').trim();
    const clientProjVer = urlObj.searchParams.get('proj_ver') || '';
    const clientGroupVer = urlObj.searchParams.get('group_ver') || '';
    const clientRegVer = urlObj.searchParams.get('reg_ver') || '';

    let matchProvs = rawProvince ? [rawProvince] : [];
    if (rawProvince === 'อยุธยา' || rawProvince === 'พระนครศรีอยุธยา') {
      matchProvs = ['อยุธยา', 'พระนครศรีอยุธยา'];
    } else if (rawProvince === 'อุดรธานี' || rawProvince === 'กาฬสินธุ์') {
      matchProvs = ['อุดรธานี', 'กาฬสินธุ์'];
    } else if (rawProvince === 'ลำปาง' || rawProvince === 'น่าน') {
      matchProvs = ['ลำปาง', 'น่าน'];
    } else if (rawProvince === 'สุราษฎร์ธานี' || rawProvince === 'พังงา') {
      matchProvs = ['สุราษฎร์ธานี', 'พังงา'];
    }

    try {
      if (pgMdcPool) {
        // 1. Projects check
        let projQuery = "SELECT COUNT(*) AS count, COALESCE(MAX(COALESCE(updated_at, created_at, '')), '') AS max_ts, COALESCE(SUM(community_votes), 0) AS total_votes FROM pilot_hackathon_projects WHERE (is_precheck = 0 OR is_precheck IS NULL) AND id NOT LIKE 'precheck-%'";
        const projParams = [];
        if (matchProvs.length > 0) {
          const pHolders = matchProvs.map((p, i) => `$${i + 1}`).join(', ');
          projQuery += ` AND province IN (${pHolders})`;
          projParams.push(...matchProvs);
        }
        const projVerRes = await pgMdcPool.query(projQuery, projParams);
        const pRow = projVerRes.rows[0] || { count: 0, max_ts: '', total_votes: 0 };
        const serverProjVer = `${pRow.count}_${pRow.max_ts}_${pRow.total_votes}`;

        // 2. Coffee groups check
        const groupVerRes = await pgMdcPool.query("SELECT COUNT(*) AS count, COALESCE(MAX(COALESCE(updated_at, created_at, '')), '') AS max_ts FROM pilot_coffee_groups");
        const gRow = groupVerRes.rows[0] || { count: 0, max_ts: '' };
        const serverGroupVer = `${gRow.count}_${gRow.max_ts}`;

        // 3. Registrations check
        let regQuery = "SELECT COUNT(*) AS count, COALESCE(MAX(created_at), '') AS max_ts FROM pilot_agency_registrations";
        const regParams = [];
        if (matchProvs.length > 0) {
          const rHolders = matchProvs.map((p, i) => `$${i + 1}`).join(', ');
          regQuery += ` WHERE province IN (${rHolders})`;
          regParams.push(...matchProvs);
        }
        const regVerRes = await pgMdcPool.query(regQuery, regParams);
        const rRow = regVerRes.rows[0] || { count: 0, max_ts: '' };
        const serverRegVer = `${rRow.count}_${rRow.max_ts}`;

        const isProjModified = !clientProjVer || clientProjVer !== serverProjVer;
        const isGroupModified = !clientGroupVer || clientGroupVer !== serverGroupVer;
        const isRegModified = !clientRegVer || clientRegVer !== serverRegVer;

        if (!isProjModified && !isGroupModified && !isRegModified) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({
            ok: true,
            modified: false,
            serverTime: new Date().toISOString(),
            projVer: serverProjVer,
            groupVer: serverGroupVer,
            regVer: serverRegVer,
            dbType: 'postgres',
            dbName: 'DB-MDC'
          }));
          return;
        }

        const changed = [];
        let projectsData = null;
        let groupsData = null;
        let agenciesData = null;

        if (isProjModified) {
          changed.push('projects');
          let fullPQuery = "SELECT * FROM pilot_hackathon_projects WHERE (is_precheck = 0 OR is_precheck IS NULL) AND id NOT LIKE 'precheck-%'";
          const fullPParams = [];
          if (matchProvs.length > 0) {
            const pHolders = matchProvs.map((p, i) => `$${i + 1}`).join(', ');
            fullPQuery += ` AND province IN (${pHolders})`;
            fullPParams.push(...matchProvs);
          }
          fullPQuery += ' ORDER BY created_at DESC';
          const pFullRes = await pgMdcPool.query(fullPQuery, fullPParams);
          projectsData = pFullRes.rows.map((r) => ({
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
        }

        if (isGroupModified) {
          changed.push('coffee_groups');
          const gRowsRes = await pgMdcPool.query('SELECT * FROM pilot_coffee_groups ORDER BY order_index ASC, created_at ASC');
          groupsData = gRowsRes.rows.map((r) => ({
            key: r.key,
            name: r.name,
            bgImage: r.bg_image,
            themeColor: r.theme_color,
            accentBg: r.accent_bg,
            isCustom: Boolean(r.is_custom)
          }));
        }

        if (isRegModified) {
          changed.push('registrations');
          let fullRQuery = 'SELECT * FROM pilot_agency_registrations';
          const fullRParams = [];
          if (matchProvs.length > 0) {
            const rHolders = matchProvs.map((p, i) => `$${i + 1}`).join(', ');
            fullRQuery += ` WHERE province IN (${rHolders})`;
            fullRParams.push(...matchProvs);
          }
          fullRQuery += ' ORDER BY created_at DESC';
          const rFullRes = await pgMdcPool.query(fullRQuery, fullRParams);
          agenciesData = rFullRes.rows;
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({
          ok: true,
          modified: true,
          changed,
          projects: projectsData,
          groups: groupsData,
          agencies: agenciesData,
          serverTime: new Date().toISOString(),
          projVer: serverProjVer,
          groupVer: serverGroupVer,
          regVer: serverRegVer,
          dbType: 'postgres',
          dbName: 'DB-MDC'
        }));
        return;
      }

      // SQLite fallback
      // 1. Projects check
      let sProjQ = "SELECT COUNT(*) AS count, COALESCE(MAX(created_at), '') AS max_ts, COALESCE(SUM(community_votes), 0) AS total_votes FROM pilot_hackathon_projects WHERE (is_precheck = 0 OR is_precheck IS NULL) AND id NOT LIKE 'precheck-%'";
      const sProjParams = [];
      if (matchProvs.length > 0) {
        sProjQ += ` AND province IN (${matchProvs.map(() => '?').join(',')})`;
        sProjParams.push(...matchProvs);
      }
      const sPRow = db.prepare(sProjQ).get(...sProjParams) || { count: 0, max_ts: '', total_votes: 0 };
      const sServerProjVer = `${sPRow.count}_${sPRow.max_ts}_${sPRow.total_votes}`;

      // 2. Coffee groups check
      let sGRow = { count: 5, max_ts: '' };
      try {
        sGRow = db.prepare("SELECT COUNT(*) AS count, COALESCE(MAX(created_at), '') AS max_ts FROM pilot_coffee_groups").get() || sGRow;
      } catch {}
      const sServerGroupVer = `${sGRow.count}_${sGRow.max_ts}`;

      // 3. Registrations check
      let sRegQ = "SELECT COUNT(*) AS count, COALESCE(MAX(created_at), '') AS max_ts FROM pilot_agency_registrations";
      const sRegParams = [];
      if (matchProvs.length > 0) {
        sRegQ += ` WHERE province IN (${matchProvs.map(() => '?').join(',')})`;
        sRegParams.push(...matchProvs);
      }
      const sRRow = db.prepare(sRegQ).get(...sRegParams) || { count: 0, max_ts: '' };
      const sServerRegVer = `${sRRow.count}_${sRRow.max_ts}`;

      const isSProjMod = !clientProjVer || clientProjVer !== sServerProjVer;
      const isSGroupMod = !clientGroupVer || clientGroupVer !== sServerGroupVer;
      const isSRegMod = !clientRegVer || clientRegVer !== sServerRegVer;

      if (!isSProjMod && !isSGroupMod && !isSRegMod) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({
          ok: true,
          modified: false,
          serverTime: new Date().toISOString(),
          projVer: sServerProjVer,
          groupVer: sServerGroupVer,
          regVer: sServerRegVer,
          dbType: 'sqlite'
        }));
        return;
      }

      const sChanged = [];
      let sProjectsData = null;
      let sGroupsData = null;
      let sAgenciesData = null;

      if (isSProjMod) {
        sChanged.push('projects');
        let fullSPQuery = "SELECT * FROM pilot_hackathon_projects WHERE (is_precheck = 0 OR is_precheck IS NULL) AND id NOT LIKE 'precheck-%'";
        const fullSPParams = [];
        if (matchProvs.length > 0) {
          fullSPQuery += ` AND province IN (${matchProvs.map(() => '?').join(',')})`;
          fullSPParams.push(...matchProvs);
        }
        fullSPQuery += ' ORDER BY created_at DESC';
        const sPRows = db.prepare(fullSPQuery).all(...fullSPParams);
        sProjectsData = sPRows.map((r) => ({
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
      }

      if (isSGroupMod) {
        sChanged.push('coffee_groups');
        try {
          const gRows = db.prepare('SELECT * FROM pilot_coffee_groups ORDER BY order_index ASC, created_at ASC').all();
          sGroupsData = gRows.map((r) => ({
            key: r.key,
            name: r.name,
            bgImage: r.bg_image,
            themeColor: r.theme_color,
            accentBg: r.accent_bg,
            isCustom: Boolean(r.is_custom)
          }));
        } catch {}
      }

      if (isSRegMod) {
        sChanged.push('registrations');
        let fullSRQuery = 'SELECT * FROM pilot_agency_registrations';
        const fullSRParams = [];
        if (matchProvs.length > 0) {
          fullSRQuery += ` WHERE province IN (${matchProvs.map(() => '?').join(',')})`;
          fullSRParams.push(...matchProvs);
        }
        fullSRQuery += ' ORDER BY created_at DESC';
        sAgenciesData = db.prepare(fullSRQuery).all(...fullSRParams);
      }

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({
        ok: true,
        modified: true,
        changed: sChanged,
        projects: sProjectsData,
        groups: sGroupsData,
        agencies: sAgenciesData,
        serverTime: new Date().toISOString(),
        projVer: sServerProjVer,
        groupVer: sServerGroupVer,
        regVer: sServerRegVer,
        dbType: 'sqlite'
      }));
      return;
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: false, error: err?.message || 'Sync status check failed' }));
      return;
    }
  }

  // 1. GET /api/pilot-sqlite/state
  if (req.method === 'GET' && (pathname === '/api/pilot-sqlite/state' || pathname === '/api/pilot-postgres/state')) {
    const province = urlObj.searchParams.get('province');
    const provList = province
      ? (province === 'อยุธยา' || province === 'พระนครศรีอยุธยา'
          ? ['อยุธยา', 'พระนครศรีอยุธยา']
          : [province])
      : null;

    if (pgMdcPool) {
      let agencies = [];
      let lessonsPolicies = [];
      if (provList) {
        const pList = provList.map((_, i) => `$${i + 1}`).join(', ');
        const agRes = await pgMdcPool.query(`SELECT * FROM pilot_agency_registrations WHERE province IN (${pList}) ORDER BY created_at DESC`, provList);
        const lpRes = await pgMdcPool.query(`SELECT * FROM pilot_lessons_and_policies WHERE province IN (${pList}) ORDER BY updated_at DESC`, provList);
        agencies = agRes.rows;
        lessonsPolicies = lpRes.rows;
      } else {
        const agRes = await pgMdcPool.query('SELECT * FROM pilot_agency_registrations ORDER BY created_at DESC');
        const lpRes = await pgMdcPool.query('SELECT * FROM pilot_lessons_and_policies ORDER BY updated_at DESC');
        agencies = agRes.rows;
        lessonsPolicies = lpRes.rows;
      }

      res.statusCode = 200;
      res.end(
        JSON.stringify({
          ok: true,
          dbType: 'postgres',
          dbName: 'DB-MDC',
          dbPath: 'PostgreSQL: DB-MDC',
          recordsDir: 'data/pilot_records/',
          agencies,
          lessonsPolicies
        })
      );
      return;
    }

    const agencies = provList
      ? db
          .prepare(`SELECT * FROM pilot_agency_registrations WHERE province IN (${provList.map(() => '?').join(',')}) ORDER BY created_at DESC`)
          .all(...provList)
      : db.prepare('SELECT * FROM pilot_agency_registrations ORDER BY created_at DESC').all();

    const lessonsPolicies = provList
      ? db
          .prepare(`SELECT * FROM pilot_lessons_and_policies WHERE province IN (${provList.map(() => '?').join(',')}) ORDER BY updated_at DESC`)
          .all(...provList)
      : db.prepare('SELECT * FROM pilot_lessons_and_policies ORDER BY updated_at DESC').all();

    res.statusCode = 200;
    res.end(
      JSON.stringify({
        ok: true,
        dbPath: 'data/pilot_activities_4regions.sqlite',
        recordsDir: 'data/pilot_records/',
        agencies,
        lessonsPolicies
      })
    );
    return;
  }

  // 2. POST /api/pilot-sqlite/register-agency
  if (req.method === 'POST' && (pathname === '/api/pilot-sqlite/register-agency' || pathname === '/api/pilot-postgres/register-agency')) {
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

    const params = [
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
    ];

    if (pgMdcPool) {
      await pgMdcPool.query(`
        INSERT INTO pilot_agency_registrations (
          id, province, region, agency_name, agency_type,
          first_name, last_name, position, participant_level,
          coordinator_name, participant_role, district, subdistrict,
          phone, email, contact_info, coffee_group,
          trial_project_name, trial_project_summary, activity_date, synergy_topic,
          uploaded_files_json, extracted_data_preview, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
        ON CONFLICT (id) DO UPDATE SET
          province = EXCLUDED.province,
          region = EXCLUDED.region,
          agency_name = EXCLUDED.agency_name,
          agency_type = EXCLUDED.agency_type,
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          position = EXCLUDED.position,
          participant_level = EXCLUDED.participant_level,
          coordinator_name = EXCLUDED.coordinator_name,
          participant_role = EXCLUDED.participant_role,
          district = EXCLUDED.district,
          subdistrict = EXCLUDED.subdistrict,
          phone = EXCLUDED.phone,
          email = EXCLUDED.email,
          contact_info = EXCLUDED.contact_info,
          coffee_group = EXCLUDED.coffee_group,
          trial_project_name = EXCLUDED.trial_project_name,
          trial_project_summary = EXCLUDED.trial_project_summary,
          activity_date = EXCLUDED.activity_date,
          synergy_topic = EXCLUDED.synergy_topic,
          uploaded_files_json = EXCLUDED.uploaded_files_json,
          extracted_data_preview = EXCLUDED.extracted_data_preview,
          created_at = EXCLUDED.created_at
      `, params);

      const safeId = id.replace(/[^a-zA-Z0-9_-]/g, '_');
      const agencyFilePath = path.resolve(recordsDir, `agency_${safeId}.json`);
      try {
        fs.writeFileSync(
          agencyFilePath,
          JSON.stringify({ id, ...payload, savedAt: nowStr, db: 'DB-MDC' }, null, 2),
          'utf8'
        );
      } catch {}

      res.statusCode = 200;
      res.end(
        JSON.stringify({
          ok: true,
          id,
          savedFilePath: `data/pilot_records/agency_${safeId}.json`,
          dbType: 'postgres',
          dbName: 'DB-MDC',
          dbPath: 'PostgreSQL: DB-MDC'
        })
      );
      return;
    }

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO pilot_agency_registrations (
        id, province, region, agency_name, agency_type,
        first_name, last_name, position, participant_level,
        coordinator_name, participant_role, district, subdistrict,
        phone, email, contact_info, coffee_group,
        trial_project_name, trial_project_summary, activity_date, synergy_topic,
        uploaded_files_json, extracted_data_preview, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(...params);

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
        dbPath: 'data/pilot_activities_4regions.sqlite'
      })
    );
    return;
  }

  // 3. POST /api/pilot-sqlite/save-lesson-policy
  if (req.method === 'POST' && (pathname === '/api/pilot-sqlite/save-lesson-policy' || pathname === '/api/pilot-postgres/save-lesson-policy')) {
    const payload = await readJsonBody(req);
    const id = payload.id || `lp-${Date.now()}`;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const safeId = id.replace(/[^a-zA-Z0-9_-]/g, '_');
    const relFilePath = `data/pilot_records/pilot_lesson_policy_${safeId}.json`;
    const relMdPath = `data/pilot_records/pilot_lesson_policy_${safeId}.md`;
    const absJsonPath = path.resolve(recordsDir, `pilot_lesson_policy_${safeId}.json`);
    const absMdPath = path.resolve(recordsDir, `pilot_lesson_policy_${safeId}.md`);

    const params = [
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
    ];

    if (pgMdcPool) {
      await pgMdcPool.query(`
        INSERT INTO pilot_lessons_and_policies (
          id, province, region, activity_date, selected_project_ids_json, selected_project_names_json,
          summary_file_name, raw_activity_summary, lesson_learned_text, lesson_structured_json,
          policy_prompt, generated_policy_text, policy_structured_json, saved_file_path, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        ON CONFLICT (id) DO UPDATE SET
          province = EXCLUDED.province,
          region = EXCLUDED.region,
          activity_date = EXCLUDED.activity_date,
          selected_project_ids_json = EXCLUDED.selected_project_ids_json,
          selected_project_names_json = EXCLUDED.selected_project_names_json,
          summary_file_name = EXCLUDED.summary_file_name,
          raw_activity_summary = EXCLUDED.raw_activity_summary,
          lesson_learned_text = EXCLUDED.lesson_learned_text,
          lesson_structured_json = EXCLUDED.lesson_structured_json,
          policy_prompt = EXCLUDED.policy_prompt,
          generated_policy_text = EXCLUDED.generated_policy_text,
          policy_structured_json = EXCLUDED.policy_structured_json,
          saved_file_path = EXCLUDED.saved_file_path,
          updated_at = EXCLUDED.updated_at
      `, params);

      try {
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
          db: 'DB-MDC',
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
      } catch {}

      res.statusCode = 200;
      res.end(
        JSON.stringify({
          ok: true,
          id,
          updated_at: nowStr,
          savedFilePath: `${relFilePath} | ${relMdPath}`,
          dbType: 'postgres',
          dbName: 'DB-MDC',
          dbPath: 'PostgreSQL: DB-MDC'
        })
      );
      return;
    }

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO pilot_lessons_and_policies (
        id, province, region, activity_date, selected_project_ids_json, selected_project_names_json,
        summary_file_name, raw_activity_summary, lesson_learned_text, lesson_structured_json,
        policy_prompt, generated_policy_text, policy_structured_json, saved_file_path, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(...params);

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
        dbPath: 'data/pilot_activities_4regions.sqlite'
      })
    );
    return;
  }

  // 4. DELETE /api/pilot-sqlite/agency
  if (req.method === 'DELETE' && (pathname === '/api/pilot-sqlite/agency' || pathname === '/api/pilot-postgres/agency')) {
    const id = urlObj.searchParams.get('id');
    if (id) {
      if (pgMdcPool) {
        await pgMdcPool.query('DELETE FROM pilot_agency_registrations WHERE id = $1', [id]);
      } else {
        db.prepare('DELETE FROM pilot_agency_registrations WHERE id = ?').run(id);
      }
    }
    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true, dbType: pgMdcPool ? 'postgres' : 'sqlite', dbName: 'DB-MDC' }));
    return;
  }

  // 5. DELETE /api/pilot-sqlite/lesson-policy
  if (req.method === 'DELETE' && (pathname === '/api/pilot-sqlite/lesson-policy' || pathname === '/api/pilot-postgres/lesson-policy')) {
    const id = urlObj.searchParams.get('id');
    if (id) {
      if (pgMdcPool) {
        await pgMdcPool.query('DELETE FROM pilot_lessons_and_policies WHERE id = $1', [id]);
      } else {
        db.prepare('DELETE FROM pilot_lessons_and_policies WHERE id = ?').run(id);
      }
    }
    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true, dbType: pgMdcPool ? 'postgres' : 'sqlite', dbName: 'DB-MDC' }));
    return;
  }

  // 5.1 GET /api/pilot-sqlite/hackathon-criteria
  if (req.method === 'GET' && (pathname === '/api/pilot-sqlite/hackathon-criteria' || pathname === '/api/pilot-postgres/hackathon-criteria')) {
    const province = urlObj.searchParams.get('province') || '';
    if (pgMdcPool) {
      let row = null;
      if (province) {
        const qRes = await pgMdcPool.query(
          `SELECT * FROM pilot_hackathon_criteria 
           WHERE is_active = 1 AND (province = $1 OR province = 'ส่วนกลาง') 
           ORDER BY CASE WHEN province = $1 THEN 0 ELSE 1 END, updated_at DESC LIMIT 1`,
          [province]
        );
        row = qRes.rows[0] || null;
      }
      if (!row) {
        const qRes2 = await pgMdcPool.query('SELECT * FROM pilot_hackathon_criteria WHERE is_active = 1 ORDER BY updated_at DESC LIMIT 1');
        row = qRes2.rows[0] || null;
      }
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.end(JSON.stringify({ ok: true, data: row || null, dbType: 'postgres', dbName: 'DB-MDC', dbPath: 'PostgreSQL: DB-MDC' }));
      return;
    }

    let row = null;
    if (province) {
      row = db.prepare(
        `SELECT * FROM pilot_hackathon_criteria 
         WHERE is_active = 1 AND (province = ? OR province = 'ส่วนกลาง') 
         ORDER BY CASE WHEN province = ? THEN 0 ELSE 1 END, updated_at DESC LIMIT 1`
      ).get(province, province);
    }
    if (!row) {
      row = db.prepare('SELECT * FROM pilot_hackathon_criteria WHERE is_active = 1 ORDER BY updated_at DESC LIMIT 1').get();
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.end(JSON.stringify({ ok: true, data: row || null, dbPath: 'data/pilot_activities_4regions.sqlite' }));
    return;
  }

  // 5.2 POST /api/pilot-sqlite/hackathon-criteria
  if (req.method === 'POST' && (pathname === '/api/pilot-sqlite/hackathon-criteria' || pathname === '/api/pilot-postgres/hackathon-criteria')) {
    const body = await readJsonBody(req);
    const id = body.id || `crit-${Date.now()}`;
    const province = body.province || 'ส่วนกลาง';
    const now = new Date().toISOString();
    const sourceFilesJson = typeof body.sourceFilesJson === 'string' ? body.sourceFilesJson : JSON.stringify(body.sourceFiles || []);
    const aiAgentSkillText = body.aiAgentSkillText || '';
    const rubricJson = typeof body.rubricJson === 'string' ? body.rubricJson : JSON.stringify(body.rubric || []);
    const promptSkill = body.promptSkill || '';
    const promptRubric = body.promptRubric || '';

    if (pgMdcPool) {
      if (body.setLatestActive !== false) {
        await pgMdcPool.query('UPDATE pilot_hackathon_criteria SET is_active = 0 WHERE province = $1', [province]);
      }
      await pgMdcPool.query(`
        INSERT INTO pilot_hackathon_criteria 
        (id, province, created_at, updated_at, source_files_json, ai_agent_skill_text, rubric_json, prompt_skill, prompt_rubric, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 1)
        ON CONFLICT (id) DO UPDATE SET
          province = EXCLUDED.province,
          updated_at = EXCLUDED.updated_at,
          source_files_json = EXCLUDED.source_files_json,
          ai_agent_skill_text = EXCLUDED.ai_agent_skill_text,
          rubric_json = EXCLUDED.rubric_json,
          prompt_skill = EXCLUDED.prompt_skill,
          prompt_rubric = EXCLUDED.prompt_rubric,
          is_active = 1
      `, [id, province, body.createdAt || now, now, sourceFilesJson, aiAgentSkillText, rubricJson, promptSkill, promptRubric]);

      res.statusCode = 200;
      res.end(JSON.stringify({ ok: true, id, dbType: 'postgres', dbName: 'DB-MDC', dbPath: 'PostgreSQL: DB-MDC', updatedAt: now }));
      return;
    }

    if (body.setLatestActive !== false) {
      db.prepare('UPDATE pilot_hackathon_criteria SET is_active = 0 WHERE province = ?').run(province);
    }

    db.prepare(`
      INSERT OR REPLACE INTO pilot_hackathon_criteria 
      (id, province, created_at, updated_at, source_files_json, ai_agent_skill_text, rubric_json, prompt_skill, prompt_rubric, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).run(id, province, body.createdAt || now, now, sourceFilesJson, aiAgentSkillText, rubricJson, promptSkill, promptRubric);

    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true, id, dbPath: 'data/pilot_activities_4regions.sqlite', updatedAt: now }));
    return;
  }

  // 5.2.1 GET /api/pilot-sqlite/criteria-virtues
  if (req.method === 'GET' && (pathname === '/api/pilot-sqlite/criteria-virtues' || pathname === '/api/pilot-postgres/criteria-virtues')) {
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

    if (pgMdcPool) {
      let rowRes = await pgMdcPool.query('SELECT * FROM pilot_criteria_selected_virtues WHERE province = $1', [province]);
      let row = rowRes.rows[0];
      if (!row) {
        let fallbackRes = await pgMdcPool.query('SELECT * FROM pilot_criteria_selected_virtues WHERE province = $1', ['ส่วนกลาง']);
        row = fallbackRes.rows[0];
      }
      let virtues = defaultWeaknessMap[province] || ['พอเพียง'];
      if (row && row.selected_virtues_json) {
        try {
          const parsed = JSON.parse(row.selected_virtues_json);
          if (Array.isArray(parsed) && parsed.length > 0) virtues = parsed;
        } catch {}
      }
      res.statusCode = 200;
      res.end(JSON.stringify({ ok: true, province, virtues, dbType: 'postgres', dbName: 'DB-MDC', updatedAt: row?.updated_at || null }));
      return;
    }

    let row = db.prepare('SELECT * FROM pilot_criteria_selected_virtues WHERE province = ?').get(province);
    if (!row) {
      row = db.prepare('SELECT * FROM pilot_criteria_selected_virtues WHERE province = ?').get('ส่วนกลาง');
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
  if (req.method === 'POST' && (pathname === '/api/pilot-sqlite/criteria-virtues' || pathname === '/api/pilot-postgres/criteria-virtues')) {
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

    if (pgMdcPool) {
      await pgMdcPool.query(`
        INSERT INTO pilot_criteria_selected_virtues (province, selected_virtues_json, updated_at)
        VALUES ($1, $2, $3)
        ON CONFLICT (province) DO UPDATE SET
          selected_virtues_json = EXCLUDED.selected_virtues_json,
          updated_at = EXCLUDED.updated_at
      `, [province, JSON.stringify(virtues), now]);

      res.statusCode = 200;
      res.end(JSON.stringify({ ok: true, province, virtues, dbType: 'postgres', dbName: 'DB-MDC', updatedAt: now }));
      return;
    }

    db.prepare(`
      INSERT OR REPLACE INTO pilot_criteria_selected_virtues (province, selected_virtues_json, updated_at)
      VALUES (?, ?, ?)
    `).run(province, JSON.stringify(virtues), now);

    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true, province, virtues, updatedAt: now }));
    return;
  }

  // 5.2.3 GET /api/pilot-sqlite/ai-config
  if (req.method === 'GET' && (pathname === '/api/pilot-sqlite/ai-config' || pathname === '/api/pilot-postgres/ai-config')) {
    try {
      if (pgMdcPool) {
        let row = (await pgMdcPool.query('SELECT * FROM pilot_ai_config WHERE id = $1', ['default'])).rows[0];
        if (!row && fs.existsSync(aiConfigFile)) {
          try {
            const fileData = JSON.parse(fs.readFileSync(aiConfigFile, 'utf8'));
            if (fileData && fileData.apiKey) {
              const now = new Date().toISOString();
              await pgMdcPool.query(`
                INSERT INTO pilot_ai_config (id, api_key, model, system_prompt, generator_prompt, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (id) DO UPDATE SET
                  api_key = EXCLUDED.api_key,
                  model = EXCLUDED.model,
                  system_prompt = EXCLUDED.system_prompt,
                  generator_prompt = EXCLUDED.generator_prompt,
                  updated_at = EXCLUDED.updated_at
              `, ['default', fileData.apiKey, fileData.model || 'openai/gpt-4o-mini', fileData.systemPrompt || '', fileData.generatorPrompt || '', now]);
              row = {
                id: 'default',
                api_key: fileData.apiKey,
                model: fileData.model || 'openai/gpt-4o-mini',
                system_prompt: fileData.systemPrompt || '',
                generator_prompt: fileData.generatorPrompt || '',
                updated_at: now
              };
            }
          } catch {}
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
            updatedAt: row.updated_at,
            dbType: 'postgres',
            dbName: 'DB-MDC'
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
          updatedAt: null,
          dbType: 'postgres',
          dbName: 'DB-MDC'
        }));
        return;
      }

      let row = db.prepare('SELECT * FROM pilot_ai_config WHERE id = ?').get('default');
      if (!row && fs.existsSync(aiConfigFile)) {
        try {
          const fileData = JSON.parse(fs.readFileSync(aiConfigFile, 'utf8'));
          if (fileData && fileData.apiKey) {
            const now = new Date().toISOString();
            db.prepare(`
              INSERT OR REPLACE INTO pilot_ai_config (id, api_key, model, system_prompt, generator_prompt, updated_at)
              VALUES (?, ?, ?, ?, ?, ?)
            `).run('default', fileData.apiKey, fileData.model || 'openai/gpt-4o-mini', fileData.systemPrompt || '', fileData.generatorPrompt || '', now);
            row = {
              id: 'default',
              api_key: fileData.apiKey,
              model: fileData.model || 'openai/gpt-4o-mini',
              system_prompt: fileData.system_prompt || '',
              generator_prompt: fileData.generator_prompt || '',
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
  if (req.method === 'POST' && (pathname === '/api/pilot-sqlite/ai-config' || pathname === '/api/pilot-postgres/ai-config')) {
    try {
      const body = await readJsonBody(req);
      const apiKey = (body.apiKey || '').trim().replace(/^["']|["']$/g, '');
      const model = (body.model || 'openai/gpt-4o-mini').trim();
      const systemPrompt = (body.systemPrompt || '').trim();
      const generatorPrompt = (body.generatorPrompt || '').trim();
      const now = new Date().toISOString();

      if (pgMdcPool) {
        await pgMdcPool.query(`
          INSERT INTO pilot_ai_config (id, api_key, model, system_prompt, generator_prompt, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (id) DO UPDATE SET
            api_key = EXCLUDED.api_key,
            model = EXCLUDED.model,
            system_prompt = EXCLUDED.system_prompt,
            generator_prompt = EXCLUDED.generator_prompt,
            updated_at = EXCLUDED.updated_at
        `, ['default', apiKey, model, systemPrompt, generatorPrompt, now]);

        try {
          fs.writeFileSync(aiConfigFile, JSON.stringify({
            apiKey, model, systemPrompt, generatorPrompt, updatedAt: now
          }, null, 2), 'utf8');
        } catch (err) {
          console.warn('Failed writing ai_config.json:', err);
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({
          ok: true,
          message: 'บันทึกการตั้งค่า AI ลง PostgreSQL (DB-MDC) เรียบร้อยแล้ว (ทุกเครื่องเชื่อมต่อได้ทันที)',
          isConfigured: Boolean(apiKey),
          apiKey,
          model,
          systemPrompt,
          generatorPrompt,
          updatedAt: now,
          dbType: 'postgres',
          dbName: 'DB-MDC'
        }));
        return;
      }

      db.prepare(`
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
  if (req.method === 'GET' && (pathname === '/api/pilot-sqlite/coffee-groups' || pathname === '/api/pilot-postgres/coffee-groups')) {
    try {
      if (pgMdcPool) {
        const rowsRes = await pgMdcPool.query('SELECT * FROM pilot_coffee_groups ORDER BY order_index ASC, created_at ASC');
        const groups = rowsRes.rows.map((r) => ({
          key: r.key,
          name: r.name,
          bgImage: r.bg_image,
          themeColor: r.theme_color,
          accentBg: r.accent_bg,
          isCustom: Boolean(r.is_custom)
        }));
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ ok: true, groups, dbType: 'postgres', dbName: 'DB-MDC' }));
        return;
      }

      const rows = db.prepare('SELECT * FROM pilot_coffee_groups ORDER BY order_index ASC, created_at ASC').all();
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
  if (req.method === 'POST' && (pathname === '/api/pilot-sqlite/coffee-groups' || pathname === '/api/pilot-postgres/coffee-groups')) {
    try {
      const body = await readJsonBody(req);
      const now = new Date().toISOString();

      if (pgMdcPool) {
        if (body.action === 'reset') {
          await pgMdcPool.query('DELETE FROM pilot_coffee_groups');
          const defaultGroups = [
            { key: 'mocha', name: 'กลุ่มมอคค่า', bg_image: '/theme/coffee_mocha_bg.jpg', theme_color: '#78350f', accent_bg: '#fef3c7', is_custom: 0, order_index: 1 },
            { key: 'cappuccino', name: 'กลุ่มคาปูชิโน', bg_image: '/theme/coffee_cappuccino_bg.jpg', theme_color: '#92400e', accent_bg: '#ffedd5', is_custom: 0, order_index: 2 },
            { key: 'americano', name: 'กลุ่มอเมริกาโน', bg_image: '/theme/coffee_americano_bg.jpg', theme_color: '#1c1917', accent_bg: '#f5f5f4', is_custom: 0, order_index: 3 },
            { key: 'espresso', name: 'กลุ่มเอสเพรสโซ', bg_image: '/theme/coffee_preset_05_espresso.jpg', theme_color: '#451a03', accent_bg: '#fef2f2', is_custom: 0, order_index: 4 },
            { key: 'latte', name: 'กลุ่มลาเต้', bg_image: '/theme/coffee_preset_06_latte.jpg', theme_color: '#b45309', accent_bg: '#fffbeb', is_custom: 0, order_index: 5 }
          ];
          for (const g of defaultGroups) {
            await pgMdcPool.query(
              `INSERT INTO pilot_coffee_groups (key, name, bg_image, theme_color, accent_bg, is_custom, order_index, created_at, updated_at)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
              [g.key, g.name, g.bg_image, g.theme_color, g.accent_bg, g.is_custom, g.order_index, now, now]
            );
          }
        } else {
          const grp = body.group || body;
          const currentRows = (await pgMdcPool.query('SELECT key FROM pilot_coffee_groups')).rows;
          const rawKey = (grp.key || `group_${Date.now()}`).toLowerCase().replace(/[^a-z0-9]/g, '_');
          const key = currentRows.some((r) => r.key === rawKey && (!body.isEdit || body.originalKey !== r.key))
            ? (body.isEdit ? rawKey : `${rawKey}_${Date.now()}`)
            : rawKey;

          const maxOrderRes = await pgMdcPool.query('SELECT MAX(order_index) as m FROM pilot_coffee_groups');
          const maxOrder = maxOrderRes.rows[0]?.m || 0;
          const orderIndex = typeof grp.orderIndex === 'number' ? grp.orderIndex : maxOrder + 1;

          await pgMdcPool.query(`
            INSERT INTO pilot_coffee_groups (key, name, bg_image, theme_color, accent_bg, is_custom, order_index, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (key) DO UPDATE SET
              name = EXCLUDED.name,
              bg_image = EXCLUDED.bg_image,
              theme_color = EXCLUDED.theme_color,
              accent_bg = EXCLUDED.accent_bg,
              is_custom = EXCLUDED.is_custom,
              order_index = EXCLUDED.order_index,
              updated_at = EXCLUDED.updated_at
          `, [
            key,
            grp.name || 'กลุ่มกาแฟสร้างสรรค์คุณธรรม',
            grp.bgImage || grp.bg_image || '/theme/coffee_preset_01_beans.jpg',
            grp.themeColor || grp.theme_color || '#78350f',
            grp.accentBg || grp.accent_bg || '#fef3c7',
            grp.isCustom !== undefined ? (grp.isCustom ? 1 : 0) : 1,
            orderIndex,
            now,
            now
          ]);
        }

        const rowsRes = await pgMdcPool.query('SELECT * FROM pilot_coffee_groups ORDER BY order_index ASC, created_at ASC');
        const groups = rowsRes.rows.map((r) => ({
          key: r.key,
          name: r.name,
          bgImage: r.bg_image,
          themeColor: r.theme_color,
          accentBg: r.accent_bg,
          isCustom: Boolean(r.is_custom)
        }));

        try { fs.writeFileSync(coffeeGroupsFile, JSON.stringify(groups, null, 2), 'utf8'); } catch {}

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ ok: true, groups, dbType: 'postgres', dbName: 'DB-MDC', message: 'บันทึกกลุ่มกาแฟลง PostgreSQL (DB-MDC) เรียบร้อยแล้ว' }));
        return;
      }

      if (body.action === 'reset') {
        db.prepare('DELETE FROM pilot_coffee_groups').run();
        const defaultGroups = [
          { key: 'mocha', name: 'กลุ่มมอคค่า', bg_image: '/theme/coffee_mocha_bg.jpg', theme_color: '#78350f', accent_bg: '#fef3c7', is_custom: 0, order_index: 1 },
          { key: 'cappuccino', name: 'กลุ่มคาปูชิโน', bg_image: '/theme/coffee_cappuccino_bg.jpg', theme_color: '#92400e', accent_bg: '#ffedd5', is_custom: 0, order_index: 2 },
          { key: 'americano', name: 'กลุ่มอเมริกาโน', bg_image: '/theme/coffee_americano_bg.jpg', theme_color: '#1c1917', accent_bg: '#f5f5f4', is_custom: 0, order_index: 3 },
          { key: 'espresso', name: 'กลุ่มเอสเพรสโซ', bg_image: '/theme/coffee_preset_05_espresso.jpg', theme_color: '#451a03', accent_bg: '#fef2f2', is_custom: 0, order_index: 4 },
          { key: 'latte', name: 'กลุ่มลาเต้', bg_image: '/theme/coffee_preset_06_latte.jpg', theme_color: '#b45309', accent_bg: '#fffbeb', is_custom: 0, order_index: 5 }
        ];
        const insertStmt = db.prepare(`
          INSERT INTO pilot_coffee_groups (key, name, bg_image, theme_color, accent_bg, is_custom, order_index, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const g of defaultGroups) {
          insertStmt.run(g.key, g.name, g.bg_image, g.theme_color, g.accent_bg, g.is_custom, g.order_index, now, now);
        }
      } else {
        const grp = body.group || body;
        const currentRows = db.prepare('SELECT * FROM pilot_coffee_groups').all();
        const rawKey = (grp.key || `group_${Date.now()}`).toLowerCase().replace(/[^a-z0-9]/g, '_');
        const key = currentRows.some((r) => r.key === rawKey && (!body.isEdit || body.originalKey !== r.key))
          ? (body.isEdit ? rawKey : `${rawKey}_${Date.now()}`)
          : rawKey;

        const maxOrder = db.prepare('SELECT MAX(order_index) as m FROM pilot_coffee_groups').get()?.m || 0;
        const orderIndex = typeof grp.orderIndex === 'number' ? grp.orderIndex : maxOrder + 1;

        db.prepare(`
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

      const rows = db.prepare('SELECT * FROM pilot_coffee_groups ORDER BY order_index ASC, created_at ASC').all();
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
  if (req.method === 'DELETE' && (pathname === '/api/pilot-sqlite/coffee-groups' || pathname === '/api/pilot-postgres/coffee-groups')) {
    try {
      const key = urlObj.searchParams.get('key');
      if (!key) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ ok: false, error: 'Missing key parameter' }));
        return;
      }

      if (pgMdcPool) {
        const cRes = await pgMdcPool.query('SELECT COUNT(*) as cnt FROM pilot_coffee_groups');
        const count = Number(cRes.rows[0]?.cnt || 0);
        if (count <= 1) {
          res.statusCode = 400;
          res.end(JSON.stringify({ ok: false, error: 'ไม่สามารถลบกลุ่มทั้งหมดได้ ต้องมีอย่างน้อย 1 กลุ่ม' }));
          return;
        }

        await pgMdcPool.query('DELETE FROM pilot_coffee_groups WHERE key = $1', [key]);

        const rowsRes = await pgMdcPool.query('SELECT * FROM pilot_coffee_groups ORDER BY order_index ASC, created_at ASC');
        const groups = rowsRes.rows.map((r) => ({
          key: r.key,
          name: r.name,
          bgImage: r.bg_image,
          themeColor: r.theme_color,
          accentBg: r.accent_bg,
          isCustom: Boolean(r.is_custom)
        }));

        try { fs.writeFileSync(coffeeGroupsFile, JSON.stringify(groups, null, 2), 'utf8'); } catch {}

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ ok: true, groups, dbType: 'postgres', dbName: 'DB-MDC', message: 'ลบกลุ่มกาแฟจาก PostgreSQL (DB-MDC) เรียบร้อยแล้ว' }));
        return;
      }

      const count = db.prepare('SELECT COUNT(*) as cnt FROM pilot_coffee_groups').get()?.cnt || 0;
      if (count <= 1) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ ok: false, error: 'ไม่สามารถลบกลุ่มทั้งหมดได้ ต้องมีอย่างน้อย 1 กลุ่ม' }));
        return;
      }

      db.prepare('DELETE FROM pilot_coffee_groups WHERE key = ?').run(key);

      const rows = db.prepare('SELECT * FROM pilot_coffee_groups ORDER BY order_index ASC, created_at ASC').all();
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
  if (req.method === 'GET' && (pathname === '/api/pilot-sqlite/hackathon-projects' || pathname === '/api/pilot-postgres/hackathon-projects')) {
    const rawProvince = (urlObj.searchParams.get('province') || '').trim();
    const includePrecheck = urlObj.searchParams.get('include_precheck') === 'true';

    if (pgMdcPool) {
      let query = 'SELECT * FROM pilot_hackathon_projects';
      const params = [];
      const whereConditions = [];

      if (!includePrecheck) {
        whereConditions.push("(is_precheck = 0 OR is_precheck IS NULL) AND id NOT LIKE 'precheck-%'");
      }

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
        const pHolders = matchProvs.map((p) => {
          params.push(p);
          return `$${params.length}`;
        }).join(', ');
        whereConditions.push(`province IN (${pHolders})`);
      }

      if (whereConditions.length > 0) {
        query += ` WHERE ${whereConditions.join(' AND ')}`;
      }
      query += ' ORDER BY created_at DESC';

      const pRes = await pgMdcPool.query(query, params);
      const projects = pRes.rows.map((r) => ({
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
      res.end(JSON.stringify({ ok: true, data: projects, total: projects.length, dbType: 'postgres', dbName: 'DB-MDC', dbPath: 'PostgreSQL: DB-MDC' }));
      return;
    }

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
      rows = db.prepare(`SELECT * FROM pilot_hackathon_projects WHERE province IN (${placeholders}) ${precheckFilter} ORDER BY created_at DESC`).all(...matchProvs);
    } else {
      const whereClause = includePrecheck
        ? ''
        : "WHERE (is_precheck = 0 OR is_precheck IS NULL) AND id NOT LIKE 'precheck-%'";
      rows = db.prepare(`SELECT * FROM pilot_hackathon_projects ${whereClause} ORDER BY created_at DESC`).all();
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
    res.end(JSON.stringify({ ok: true, data: projects, total: projects.length, dbPath: 'data/pilot_activities_4regions.sqlite' }));
    return;
  }

  // 5.4 POST /api/pilot-sqlite/hackathon-projects
  if (req.method === 'POST' && (pathname === '/api/pilot-sqlite/hackathon-projects' || pathname === '/api/pilot-postgres/hackathon-projects')) {
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

    const params = [
      id, province, groupKey, groupName, projectName, targetMoralVirtue,
      targetAudience, targetArea, proposalDetails, activityPlan, behavioralKpi,
      proposerName, proposerAgency, proposerPosition, proposerLevel, challengeTopic,
      evaluatedCriteriaVirtuesJson, aiScore, aiScoreBreakdownJson, aiRecommendations,
      communityVotes, isPrecheck, createdAt, now
    ];

    if (pgMdcPool) {
      await pgMdcPool.query(`
        INSERT INTO pilot_hackathon_projects (
          id, province, group_key, group_name, project_name, target_moral_virtue,
          target_audience, target_area, proposal_details, activity_plan, behavioral_kpi,
          proposer_name, proposer_agency, proposer_position, proposer_level, challenge_topic,
          evaluated_criteria_virtues_json, ai_score, ai_score_breakdown_json, ai_recommendations,
          community_votes, is_precheck, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
        ON CONFLICT (id) DO UPDATE SET
          province = EXCLUDED.province,
          group_key = EXCLUDED.group_key,
          group_name = EXCLUDED.group_name,
          project_name = EXCLUDED.project_name,
          target_moral_virtue = EXCLUDED.target_moral_virtue,
          target_audience = EXCLUDED.target_audience,
          target_area = EXCLUDED.target_area,
          proposal_details = EXCLUDED.proposal_details,
          activity_plan = EXCLUDED.activity_plan,
          behavioral_kpi = EXCLUDED.behavioral_kpi,
          proposer_name = EXCLUDED.proposer_name,
          proposer_agency = EXCLUDED.proposer_agency,
          proposer_position = EXCLUDED.proposer_position,
          proposer_level = EXCLUDED.proposer_level,
          challenge_topic = EXCLUDED.challenge_topic,
          evaluated_criteria_virtues_json = EXCLUDED.evaluated_criteria_virtues_json,
          ai_score = EXCLUDED.ai_score,
          ai_score_breakdown_json = EXCLUDED.ai_score_breakdown_json,
          ai_recommendations = EXCLUDED.ai_recommendations,
          community_votes = EXCLUDED.community_votes,
          is_precheck = EXCLUDED.is_precheck,
          updated_at = EXCLUDED.updated_at
      `, params);

      res.statusCode = 200;
      res.end(JSON.stringify({ ok: true, id, dbType: 'postgres', dbName: 'DB-MDC', dbPath: 'PostgreSQL: DB-MDC', aiScore, isPrecheck, updatedAt: now }));
      return;
    }

    db.prepare(`
      INSERT OR REPLACE INTO pilot_hackathon_projects (
        id, province, group_key, group_name, project_name, target_moral_virtue,
        target_audience, target_area, proposal_details, activity_plan, behavioral_kpi,
        proposer_name, proposer_agency, proposer_position, proposer_level, challenge_topic,
        evaluated_criteria_virtues_json, ai_score, ai_score_breakdown_json, ai_recommendations,
        community_votes, is_precheck, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(...params);

    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true, id, dbPath: 'data/pilot_activities_4regions.sqlite', aiScore, isPrecheck, updatedAt: now }));
    return;
  }

  // 5.4.1 POST /api/pilot-sqlite/hackathon-vote
  if (req.method === 'POST' && (pathname === '/api/pilot-sqlite/hackathon-vote' || pathname === '/api/pilot-postgres/hackathon-vote')) {
    const body = await readJsonBody(req);
    const projectId = body.projectId;
    const newVotes = typeof body.newVoteCount === 'number' ? body.newVoteCount : 1;
    const now = new Date().toISOString();

    if (pgMdcPool) {
      if (projectId) {
        await pgMdcPool.query('UPDATE pilot_hackathon_projects SET community_votes = $1, updated_at = $2 WHERE id = $3', [newVotes, now, projectId]);
      }
      res.statusCode = 200;
      res.end(JSON.stringify({ ok: true, projectId, newVotes, dbType: 'postgres', dbName: 'DB-MDC', updatedAt: now }));
      return;
    }

    if (projectId) {
      db.prepare('UPDATE pilot_hackathon_projects SET community_votes = ?, updated_at = ? WHERE id = ?').run(newVotes, now, projectId);
    }
    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true, projectId, newVotes, updatedAt: now }));
    return;
  }

  // 5.5 POST /api/pilot-sqlite/hackathon-reset
  if (req.method === 'POST' && (pathname === '/api/pilot-sqlite/hackathon-reset' || pathname === '/api/pilot-postgres/hackathon-reset')) {
    const body = await readJsonBody(req);
    const province = body.province || '';

    if (pgMdcPool) {
      let delRes;
      if (province) {
        delRes = await pgMdcPool.query('DELETE FROM pilot_hackathon_projects WHERE province = $1', [province]);
      } else {
        delRes = await pgMdcPool.query('DELETE FROM pilot_hackathon_projects');
      }
      const deletedCount = delRes.rowCount || 0;
      res.statusCode = 200;
      res.end(JSON.stringify({
        ok: true,
        message: `รีเซ็ตฐานข้อมูลโครงการ Hackathon เรียบร้อยแล้ว (ลบ ${deletedCount} โครงการใน PostgreSQL: DB-MDC)`,
        deletedCount,
        dbType: 'postgres',
        dbName: 'DB-MDC',
        dbPath: 'PostgreSQL: DB-MDC'
      }));
      return;
    }

    let deletedCount = 0;
    if (province) {
      const info = db.prepare('DELETE FROM pilot_hackathon_projects WHERE province = ?').run(province);
      deletedCount = Number(info.changes);
    } else {
      const info = db.prepare('DELETE FROM pilot_hackathon_projects').run();
      deletedCount = Number(info.changes);
    }

    res.statusCode = 200;
    res.end(JSON.stringify({
      ok: true,
      message: `รีเซ็ตฐานข้อมูลโครงการ Hackathon เรียบร้อยแล้ว (ลบ ${deletedCount} โครงการใน SQLite)`,
      deletedCount,
      dbPath: 'data/pilot_activities_4regions.sqlite'
    }));
    return;
  }

  // 5.5.0 POST /api/pilot-sqlite/project-delete
  if (req.method === 'POST' && (pathname === '/api/pilot-sqlite/project-delete' || pathname === '/api/pilot-postgres/project-delete')) {
    const body = await readJsonBody(req);
    const projectId = body.id || body.projectId || '';
    if (!projectId) {
      res.statusCode = 400;
      res.end(JSON.stringify({ ok: false, error: 'Missing projectId' }));
      return;
    }

    if (pgMdcPool) {
      const delRes = await pgMdcPool.query('DELETE FROM pilot_hackathon_projects WHERE id = $1', [projectId]);
      const deletedCount = delRes.rowCount || 0;
      res.statusCode = 200;
      res.end(JSON.stringify({
        ok: true,
        message: `ลบโครงการรหัส ${projectId} เรียบร้อยแล้ว (${deletedCount} แถวใน PostgreSQL: DB-MDC)`,
        deletedCount,
        id: projectId,
        dbType: 'postgres',
        dbName: 'DB-MDC',
        dbPath: 'PostgreSQL: DB-MDC'
      }));
      return;
    }

    const info = db.prepare('DELETE FROM pilot_hackathon_projects WHERE id = ?').run(projectId);
    const deletedCount = Number(info.changes);
    res.statusCode = 200;
    res.end(JSON.stringify({
      ok: true,
      message: `ลบโครงการรหัส ${projectId} เรียบร้อยแล้ว (${deletedCount} แถวใน SQLite)`,
      deletedCount,
      id: projectId,
      dbPath: 'data/pilot_activities_4regions.sqlite'
    }));
    return;
  }

  // 5.5.1 POST /api/pilot-sqlite/clear-activity-vote-system
  if (req.method === 'POST' && (pathname === '/api/pilot-sqlite/clear-activity-vote-system' || pathname === '/api/pilot-postgres/clear-activity-vote-system')) {
    try {
      if (pgMdcPool) {
        const r1 = await pgMdcPool.query('DELETE FROM pilot_hackathon_projects');
        const r2 = await pgMdcPool.query('DELETE FROM pilot_hackathon_criteria');
        const r3 = await pgMdcPool.query('DELETE FROM pilot_agency_registrations');
        const r4 = await pgMdcPool.query('DELETE FROM pilot_lessons_and_policies');
        const delProj = r1.rowCount || 0;
        const delCrit = r2.rowCount || 0;
        const delAgency = r3.rowCount || 0;
        const delLesson = r4.rowCount || 0;
        const totalDeleted = delProj + delCrit + delAgency + delLesson;

        res.statusCode = 200;
        res.end(JSON.stringify({
          ok: true,
          message: `ลบข้อมูลในตารางทั้งหมดของระบบกิจกรรมและการโหวตโครงการเรียบร้อยแล้ว (รวม ${totalDeleted} แถวใน PostgreSQL: DB-MDC)`,
          totalDeleted,
          deletedCounts: {
            pilot_hackathon_projects: delProj,
            pilot_hackathon_criteria: delCrit,
            pilot_agency_registrations: delAgency,
            pilot_lessons_and_policies: delLesson
          },
          dbType: 'postgres',
          dbName: 'DB-MDC',
          dbPath: 'PostgreSQL: DB-MDC'
        }));
        return;
      }

      const delProj = Number(db.prepare('DELETE FROM pilot_hackathon_projects').run().changes);
      const delCrit = Number(db.prepare('DELETE FROM pilot_hackathon_criteria').run().changes);
      const delAgency = Number(db.prepare('DELETE FROM pilot_agency_registrations').run().changes);
      const delLesson = Number(db.prepare('DELETE FROM pilot_lessons_and_policies').run().changes);
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
        dbPath: 'data/pilot_activities_4regions.sqlite'
      }));
      return;
    } catch (err) {
      res.statusCode = 500;
      res.end(JSON.stringify({ ok: false, error: err?.message || 'Failed to clear activity vote tables' }));
      return;
    }
  }

  // 5.5.2 POST /api/pilot-sqlite/reset-registrations
  if (req.method === 'POST' && (pathname === '/api/pilot-sqlite/reset-registrations' || pathname === '/api/pilot-postgres/reset-registrations')) {
    try {
      const province = urlObj.searchParams.get('province');

      if (pgMdcPool) {
        let deletedCount = 0;
        if (province && province !== 'ALL') {
          const provList = (province === 'อยุธยา' || province === 'พระนครศรีอยุธยา') ? ['อยุธยา', 'พระนครศรีอยุธยา'] : [province];
          const placeholders = provList.map((_, i) => `$${i + 1}`).join(', ');
          const delRes = await pgMdcPool.query(`DELETE FROM pilot_agency_registrations WHERE province IN (${placeholders})`, provList);
          deletedCount = delRes.rowCount || 0;
        } else {
          const delRes = await pgMdcPool.query('DELETE FROM pilot_agency_registrations');
          deletedCount = delRes.rowCount || 0;
        }

        res.statusCode = 200;
        res.end(JSON.stringify({
          ok: true,
          message: province && province !== 'ALL'
            ? `ลบข้อมูลผู้ลงทะเบียนจังหวัด ${province} เรียบร้อยแล้ว (ลบ ${deletedCount} แถว ใน PostgreSQL: DB-MDC)`
            : `ลบข้อมูลผู้ลงทะเบียนทั้งหมดเรียบร้อยแล้ว (ลบ ${deletedCount} แถว ใน PostgreSQL: DB-MDC)`,
          deletedCount,
          province: province || 'ALL',
          dbType: 'postgres',
          dbName: 'DB-MDC',
          dbPath: 'PostgreSQL: DB-MDC'
        }));
        return;
      }

      let deletedCount = 0;
      if (province && province !== 'ALL') {
        const provList = (province === 'อยุธยา' || province === 'พระนครศรีอยุธยา') ? ['อยุธยา', 'พระนครศรีอยุธยา'] : [province];
        deletedCount = Number(db.prepare(`DELETE FROM pilot_agency_registrations WHERE province IN (${provList.map(() => '?').join(',')})`).run(...provList).changes);
      } else {
        deletedCount = Number(db.prepare('DELETE FROM pilot_agency_registrations').run().changes);
      }

      res.statusCode = 200;
      res.end(JSON.stringify({
        ok: true,
        message: province && province !== 'ALL'
          ? `ลบข้อมูลผู้ลงทะเบียนจังหวัด ${province} เรียบร้อยแล้ว (ลบ ${deletedCount} แถว)`
          : `ลบข้อมูลผู้ลงทะเบียนทั้งหมดเรียบร้อยแล้ว (ลบ ${deletedCount} แถว)`,
        deletedCount,
        province: province || 'ALL',
        dbPath: 'data/pilot_activities_4regions.sqlite'
      }));
      return;
    } catch (err) {
      res.statusCode = 500;
      res.end(JSON.stringify({ ok: false, error: err?.message || 'Failed to reset registrations' }));
      return;
    }
  }

  // 5.6 GET /api/pilot-sqlite/tables
  if (req.method === 'GET' && (pathname === '/api/pilot-sqlite/tables' || pathname === '/api/pilot-postgres/tables')) {
    try {
      if (pgMdcPool) {
        const tblRes = await pgMdcPool.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          ORDER BY table_name ASC
        `);
        const tables = [];
        for (const t of tblRes.rows) {
          const tName = t.table_name;
          let rowCount = 0;
          try {
            const cRes = await pgMdcPool.query(`SELECT COUNT(*) as cnt FROM "${tName}"`);
            rowCount = Number(cRes.rows[0]?.cnt || 0);
          } catch {}
          let columns = [];
          try {
            const colRes = await pgMdcPool.query(
              `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position ASC`,
              [tName]
            );
            columns = colRes.rows.map(r => r.column_name);
          } catch {}
          tables.push({
            name: tName,
            rowCount,
            columnCount: columns.length,
            columns
          });
        }

        res.statusCode = 200;
        res.end(JSON.stringify({
          ok: true,
          dbType: 'postgres',
          dbName: 'DB-MDC',
          totalTables: tables.length,
          tables,
          dbPath: 'PostgreSQL: DB-MDC'
        }));
        return;
      }

      const tableRows = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name ASC").all();
      const tables = tableRows.map(t => {
        let rowCount = 0;
        let columns = [];
        try {
          const c = db.prepare(`SELECT COUNT(*) as count FROM "${t.name}"`).get();
          rowCount = c?.count ?? 0;
        } catch {}
        try {
          const colInfo = db.prepare(`PRAGMA table_info("${t.name}")`).all();
          columns = colInfo.map(ci => ci.name);
        } catch {}
        return {
          name: t.name,
          rowCount,
          columnCount: columns.length,
          columns
        };
      });

      res.statusCode = 200;
      res.end(JSON.stringify({
        ok: true,
        totalTables: tables.length,
        tables,
        dbPath: 'data/pilot_activities_4regions.sqlite'
      }));
    } catch (err) {
      res.statusCode = 500;
      res.end(JSON.stringify({ ok: false, error: err?.message || 'Failed to list SQLite tables' }));
    }
    return;
  }

  // 5.7 GET /api/pilot-sqlite/table-data
  if (req.method === 'GET' && (pathname === '/api/pilot-sqlite/table-data' || pathname === '/api/pilot-postgres/table-data')) {
    const tableName = urlObj.searchParams.get('table') || '';
    if (!tableName || !/^[a-zA-Z0-9_]+$/.test(tableName)) {
      res.statusCode = 400;
      res.end(JSON.stringify({ ok: false, error: 'Invalid or missing table parameter' }));
      return;
    }

    try {
      if (pgMdcPool) {
        const checkRes = await pgMdcPool.query(
          `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1`,
          [tableName]
        );
        if (checkRes.rows.length === 0) {
          res.statusCode = 404;
          res.end(JSON.stringify({ ok: false, error: `Table '${tableName}' not found in PostgreSQL DB-MDC` }));
          return;
        }

        const colRes = await pgMdcPool.query(
          `SELECT column_name, ordinal_position, data_type, is_nullable, column_default 
           FROM information_schema.columns 
           WHERE table_schema = 'public' AND table_name = $1 
           ORDER BY ordinal_position ASC`,
          [tableName]
        );
        const columns = colRes.rows.map(c => ({
          cid: c.ordinal_position,
          name: c.column_name,
          type: c.data_type,
          notnull: c.is_nullable === 'NO' ? 1 : 0,
          dflt_value: c.column_default,
          pk: c.column_name === 'id' || c.column_name === 'key' ? 1 : 0
        }));

        const hasCreatedAt = colRes.rows.some(c => c.column_name === 'created_at');
        const orderClause = hasCreatedAt ? ' ORDER BY created_at DESC' : '';
        const rowsRes = await pgMdcPool.query(`SELECT * FROM "${tableName}"${orderClause} LIMIT 1000`);
        const countRes = await pgMdcPool.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
        const totalCount = Number(countRes.rows[0]?.count || 0);

        res.statusCode = 200;
        res.end(JSON.stringify({
          ok: true,
          tableName,
          rowCount: totalCount,
          returnedCount: rowsRes.rows.length,
          columns,
          rows: rowsRes.rows,
          dbType: 'postgres',
          dbName: 'DB-MDC',
          dbPath: 'PostgreSQL: DB-MDC'
        }));
        return;
      }

      const check = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?").get(tableName);
      if (!check) {
        res.statusCode = 404;
        res.end(JSON.stringify({ ok: false, error: `Table '${tableName}' not found in SQLite` }));
        return;
      }

      const columns = db.prepare(`PRAGMA table_info("${tableName}")`).all();
      const hasCreatedAt = columns.some(c => c.name === 'created_at');
      const orderClause = hasCreatedAt ? ' ORDER BY created_at DESC' : '';
      const rows = db.prepare(`SELECT * FROM "${tableName}"${orderClause} LIMIT 1000`).all();

      res.statusCode = 200;
      res.end(JSON.stringify({
        ok: true,
        tableName,
        rowCount: rows.length,
        columns,
        rows,
        dbPath: 'data/pilot_activities_4regions.sqlite'
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

  // --------------------------------------------------------------------------
  // CENTRAL DATASET POOL, API SCHEDULER & SYNERGY REGISTRY ENDPOINTS
  // --------------------------------------------------------------------------

  // 8. GET /api/pilot-sqlite/central-datasets
  if (req.method === 'GET' && (pathname === '/api/pilot-sqlite/central-datasets' || pathname === '/api/pilot-postgres/central-datasets')) {
    try {
      let rows = [];
      if (pgMdcPool) {
        const resDb = await pgMdcPool.query('SELECT * FROM central_dataset_pool ORDER BY updated_at DESC');
        rows = resDb.rows.map(r => ({
          id: r.id,
          name: r.name,
          category: r.category,
          domainId: r.domain_id,
          sourceType: r.source_type,
          sourceAgency: r.source_agency,
          sourceWebsite: r.source_website || '',
          rowCount: r.row_count,
          columnCount: r.column_count,
          columns: r.columns_json ? JSON.parse(r.columns_json) : [],
          rawDataSnippet: r.raw_data_json ? JSON.parse(r.raw_data_json).slice(0, 100) : [],
          cleansedDataSnippet: r.cleansed_data_json ? JSON.parse(r.cleansed_data_json).slice(0, 100) : [],
          isCleansed: Boolean(r.is_cleansed),
          isReadyForSynergy: Boolean(r.is_ready_for_synergy),
          createdAt: r.created_at,
          updatedAt: r.updated_at
        }));
      } else {
        const dbRows = db.prepare('SELECT * FROM central_dataset_pool ORDER BY updated_at DESC').all();
        rows = dbRows.map(r => ({
          id: r.id,
          name: r.name,
          category: r.category,
          domainId: r.domain_id,
          sourceType: r.source_type,
          sourceAgency: r.source_agency,
          sourceWebsite: r.source_website || '',
          rowCount: r.row_count,
          columnCount: r.column_count,
          columns: r.columns_json ? JSON.parse(r.columns_json) : [],
          rawDataSnippet: r.raw_data_json ? JSON.parse(r.raw_data_json).slice(0, 100) : [],
          cleansedDataSnippet: r.cleansed_data_json ? JSON.parse(r.cleansed_data_json).slice(0, 100) : [],
          isCleansed: Boolean(r.is_cleansed),
          isReadyForSynergy: Boolean(r.is_ready_for_synergy),
          createdAt: r.created_at,
          updatedAt: r.updated_at
        }));
      }
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: true, datasets: rows }));
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
    return;
  }

  // 9. POST /api/pilot-sqlite/central-datasets
  if (req.method === 'POST' && (pathname === '/api/pilot-sqlite/central-datasets' || pathname === '/api/pilot-postgres/central-datasets')) {
    try {
      const b = await readJsonBody(req);
      const now = new Date().toISOString();
      const id = b.id || `ds_${Date.now()}`;
      const name = b.name || 'ชุดข้อมูลนำเข้า';
      const category = b.category || 'external_agency';
      const domainId = b.domainId || b.domain_id || 'moral-index';
      const sourceType = b.sourceType || b.source_type || 'CSV/Excel';
      const sourceAgency = b.sourceAgency || b.source_agency || 'หน่วยงานภายนอก';
      const sourceWebsite = b.sourceWebsite || b.source_website || '';
      const rowCount = typeof b.rowCount === 'number' ? b.rowCount : (Array.isArray(b.rawData) ? b.rawData.length : 0);
      const columnCount = typeof b.columnCount === 'number' ? b.columnCount : (Array.isArray(b.columns) ? b.columns.length : 0);
      const columnsJson = b.columns ? JSON.stringify(b.columns) : '[]';
      const rawDataJson = b.rawData ? JSON.stringify(b.rawData) : (b.raw_data_json || '[]');
      const cleansedDataJson = b.cleansedData ? JSON.stringify(b.cleansedData) : (b.cleansed_data_json || '[]');
      const isCleansed = b.isCleansed ? 1 : 0;
      const isReadyForSynergy = b.isReadyForSynergy ? 1 : 0;

      if (pgMdcPool) {
        await pgMdcPool.query(`
          INSERT INTO central_dataset_pool 
          (id, name, category, domain_id, source_type, source_agency, source_website, row_count, column_count, columns_json, raw_data_json, cleansed_data_json, is_cleansed, is_ready_for_synergy, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            category = EXCLUDED.category,
            domain_id = EXCLUDED.domain_id,
            source_type = EXCLUDED.source_type,
            source_agency = EXCLUDED.source_agency,
            source_website = EXCLUDED.source_website,
            row_count = EXCLUDED.row_count,
            column_count = EXCLUDED.column_count,
            columns_json = EXCLUDED.columns_json,
            raw_data_json = EXCLUDED.raw_data_json,
            cleansed_data_json = EXCLUDED.cleansed_data_json,
            is_cleansed = EXCLUDED.is_cleansed,
            is_ready_for_synergy = EXCLUDED.is_ready_for_synergy,
            updated_at = EXCLUDED.updated_at
        `, [id, name, category, domainId, sourceType, sourceAgency, sourceWebsite, rowCount, columnCount, columnsJson, rawDataJson, cleansedDataJson, isCleansed, isReadyForSynergy, now, now]);
      } else {
        db.prepare(`
          INSERT OR REPLACE INTO central_dataset_pool 
          (id, name, category, domain_id, source_type, source_agency, source_website, row_count, column_count, columns_json, raw_data_json, cleansed_data_json, is_cleansed, is_ready_for_synergy, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE((SELECT created_at FROM central_dataset_pool WHERE id = ?), ?), ?)
        `).run(id, name, category, domainId, sourceType, sourceAgency, sourceWebsite, rowCount, columnCount, columnsJson, rawDataJson, cleansedDataJson, isCleansed, isReadyForSynergy, id, now, now);
      }

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: true, id, message: 'บันทึกข้อมูลเข้าคลังข้อมูลกลางเรียบร้อยแล้ว' }));
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
    return;
  }

  // 10. DELETE /api/pilot-sqlite/central-datasets
  if (req.method === 'DELETE' && (pathname === '/api/pilot-sqlite/central-datasets' || pathname === '/api/pilot-postgres/central-datasets')) {
    try {
      const id = urlObj.searchParams.get('id');
      if (id) {
        if (pgMdcPool) {
          await pgMdcPool.query('DELETE FROM central_dataset_pool WHERE id = $1', [id]);
        } else {
          db.prepare('DELETE FROM central_dataset_pool WHERE id = ?').run(id);
        }
      }
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: true, id, message: 'ลบชุดข้อมูลออกจากคลังกลางแล้ว' }));
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
    return;
  }

  // 11. GET /api/pilot-sqlite/api-schedules
  if (req.method === 'GET' && (pathname === '/api/pilot-sqlite/api-schedules' || pathname === '/api/pilot-postgres/api-schedules')) {
    try {
      let rows = [];
      if (pgMdcPool) {
        const resDb = await pgMdcPool.query('SELECT * FROM api_sync_schedules ORDER BY created_at DESC');
        rows = resDb.rows.map(r => ({
          id: r.id,
          datasetId: r.dataset_id,
          datasetName: r.dataset_name,
          endpointUrl: r.endpoint_url,
          httpMethod: r.http_method,
          headers: r.headers_json ? JSON.parse(r.headers_json) : {},
          scheduleType: r.schedule_type,
          scheduleTime: r.schedule_time,
          scheduleDays: r.schedule_days_json ? JSON.parse(r.schedule_days_json) : [],
          customDates: r.custom_dates_json ? JSON.parse(r.custom_dates_json) : [],
          isActive: Boolean(r.is_active),
          lastRunAt: r.last_run_at,
          lastStatus: r.last_status,
          lastMessage: r.last_message,
          createdAt: r.created_at,
          updatedAt: r.updated_at
        }));
      } else {
        const dbRows = db.prepare('SELECT * FROM api_sync_schedules ORDER BY created_at DESC').all();
        rows = dbRows.map(r => ({
          id: r.id,
          datasetId: r.dataset_id,
          datasetName: r.dataset_name,
          endpointUrl: r.endpoint_url,
          httpMethod: r.http_method,
          headers: r.headers_json ? JSON.parse(r.headers_json) : {},
          scheduleType: r.schedule_type,
          scheduleTime: r.schedule_time,
          scheduleDays: r.schedule_days_json ? JSON.parse(r.schedule_days_json) : [],
          customDates: r.custom_dates_json ? JSON.parse(r.custom_dates_json) : [],
          isActive: Boolean(r.is_active),
          lastRunAt: r.last_run_at,
          lastStatus: r.last_status,
          lastMessage: r.last_message,
          createdAt: r.created_at,
          updatedAt: r.updated_at
        }));
      }
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: true, schedules: rows }));
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
    return;
  }

  // 12. POST /api/pilot-sqlite/api-schedules
  if (req.method === 'POST' && (pathname === '/api/pilot-sqlite/api-schedules' || pathname === '/api/pilot-postgres/api-schedules')) {
    try {
      const b = await readJsonBody(req);
      const now = new Date().toISOString();
      const id = b.id || `sched_${Date.now()}`;
      const datasetId = b.datasetId || b.dataset_id || `ds_${Date.now()}`;
      const datasetName = b.datasetName || b.dataset_name || 'ชุดข้อมูล API';
      const endpointUrl = b.endpointUrl || b.endpoint_url || '';
      const httpMethod = b.httpMethod || b.http_method || 'GET';
      const headersJson = b.headers ? JSON.stringify(b.headers) : '{}';
      const scheduleType = b.scheduleType || b.schedule_type || 'daily';
      const scheduleTime = b.scheduleTime || b.schedule_time || '02:00';
      const scheduleDaysJson = b.scheduleDays ? JSON.stringify(b.scheduleDays) : '["monday","thursday"]';
      const customDatesJson = b.customDates ? JSON.stringify(b.customDates) : '[]';
      const isActive = b.isActive !== undefined ? (b.isActive ? 1 : 0) : 1;
      const lastStatus = b.lastStatus || 'pending';
      const lastMessage = b.lastMessage || 'รอรอบการทำงาน';

      if (pgMdcPool) {
        await pgMdcPool.query(`
          INSERT INTO api_sync_schedules 
          (id, dataset_id, dataset_name, endpoint_url, http_method, headers_json, schedule_type, schedule_time, schedule_days_json, custom_dates_json, is_active, last_run_at, last_status, last_message, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
          ON CONFLICT (id) DO UPDATE SET
            dataset_name = EXCLUDED.dataset_name,
            endpoint_url = EXCLUDED.endpoint_url,
            http_method = EXCLUDED.http_method,
            headers_json = EXCLUDED.headers_json,
            schedule_type = EXCLUDED.schedule_type,
            schedule_time = EXCLUDED.schedule_time,
            schedule_days_json = EXCLUDED.schedule_days_json,
            custom_dates_json = EXCLUDED.custom_dates_json,
            is_active = EXCLUDED.is_active,
            updated_at = EXCLUDED.updated_at
        `, [id, datasetId, datasetName, endpointUrl, httpMethod, headersJson, scheduleType, scheduleTime, scheduleDaysJson, customDatesJson, isActive, b.lastRunAt || null, lastStatus, lastMessage, now, now]);
      } else {
        db.prepare(`
          INSERT OR REPLACE INTO api_sync_schedules 
          (id, dataset_id, dataset_name, endpoint_url, http_method, headers_json, schedule_type, schedule_time, schedule_days_json, custom_dates_json, is_active, last_run_at, last_status, last_message, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE((SELECT created_at FROM api_sync_schedules WHERE id = ?), ?), ?)
        `).run(id, datasetId, datasetName, endpointUrl, httpMethod, headersJson, scheduleType, scheduleTime, scheduleDaysJson, customDatesJson, isActive, b.lastRunAt || null, lastStatus, lastMessage, id, now, now);
      }

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: true, id, message: 'บันทึกการตั้งค่ารอบเวลา API สำเร็จ' }));
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
    return;
  }

  // 13. DELETE /api/pilot-sqlite/api-schedules
  if (req.method === 'DELETE' && (pathname === '/api/pilot-sqlite/api-schedules' || pathname === '/api/pilot-postgres/api-schedules')) {
    try {
      const id = urlObj.searchParams.get('id');
      if (id) {
        if (pgMdcPool) {
          await pgMdcPool.query('DELETE FROM api_sync_schedules WHERE id = $1', [id]);
        } else {
          db.prepare('DELETE FROM api_sync_schedules WHERE id = ?').run(id);
        }
      }
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: true, id, message: 'ลบรอบเวลา API เรียบร้อยแล้ว' }));
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
    return;
  }

  // 14. POST /api/pilot-sqlite/api-schedules/trigger-sync (Immediate Sync Now)
  if (req.method === 'POST' && (pathname === '/api/pilot-sqlite/api-schedules/trigger-sync' || pathname === '/api/pilot-postgres/api-schedules/trigger-sync')) {
    try {
      const b = await readJsonBody(req);
      const scheduleId = b.scheduleId || b.id || urlObj.searchParams.get('id');
      if (!scheduleId) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ ok: false, error: 'scheduleId is required' }));
        return;
      }

      // Fetch schedule row
      let sched;
      if (pgMdcPool) {
        sched = (await pgMdcPool.query('SELECT * FROM api_sync_schedules WHERE id = $1', [scheduleId])).rows[0];
      } else {
        sched = db.prepare('SELECT * FROM api_sync_schedules WHERE id = ?').get(scheduleId);
      }

      if (!sched) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ ok: false, error: 'Schedule not found' }));
        return;
      }

      // Execute Sync
      const syncResult = await executeApiSyncJob(sched);

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: true, syncResult }));
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
    return;
  }

  // 15. GET /api/pilot-sqlite/transformation-logs
  if (req.method === 'GET' && (pathname === '/api/pilot-sqlite/transformation-logs' || pathname === '/api/pilot-postgres/transformation-logs')) {
    try {
      const datasetId = urlObj.searchParams.get('datasetId');
      let rows = [];
      if (pgMdcPool) {
        if (datasetId) {
          rows = (await pgMdcPool.query('SELECT * FROM dataset_transformation_logs WHERE dataset_id = $1 ORDER BY timestamp DESC', [datasetId])).rows;
        } else {
          rows = (await pgMdcPool.query('SELECT * FROM dataset_transformation_logs ORDER BY timestamp DESC LIMIT 200')).rows;
        }
      } else {
        if (datasetId) {
          rows = db.prepare('SELECT * FROM dataset_transformation_logs WHERE dataset_id = ? ORDER BY timestamp DESC').all(datasetId);
        } else {
          rows = db.prepare('SELECT * FROM dataset_transformation_logs ORDER BY timestamp DESC LIMIT 200').all();
        }
      }

      const formatted = rows.map(r => ({
        id: r.id,
        datasetId: r.dataset_id,
        datasetName: r.dataset_name,
        timestamp: r.timestamp,
        triggeredBy: r.triggered_by,
        provinceNormalizationCount: r.province_normalization_count,
        yearAlignmentInfo: r.year_alignment_info,
        sanitizedValuesCount: r.sanitized_values_count,
        deduplicatedRowsCount: r.deduplicated_rows_count,
        logSummary: r.log_summary_json ? JSON.parse(r.log_summary_json) : [],
        status: r.status
      }));

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: true, logs: formatted }));
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
    return;
  }

  // 16. POST /api/pilot-sqlite/transformation-logs
  if (req.method === 'POST' && (pathname === '/api/pilot-sqlite/transformation-logs' || pathname === '/api/pilot-postgres/transformation-logs')) {
    try {
      const b = await readJsonBody(req);
      const id = b.id || `log_${Date.now()}`;
      const datasetId = b.datasetId || b.dataset_id || 'unknown';
      const datasetName = b.datasetName || b.dataset_name || 'ชุดข้อมูล';
      const timestamp = b.timestamp || new Date().toISOString();
      const triggeredBy = b.triggeredBy || b.triggered_by || 'manual_cleansing';
      const provinceNormCount = Number(b.provinceNormalizationCount || 0);
      const yearAlignInfo = b.yearAlignmentInfo || '2567';
      const sanitizedCount = Number(b.sanitizedValuesCount || 0);
      const dedupCount = Number(b.deduplicatedRowsCount || 0);
      const logSummaryJson = b.logSummary ? JSON.stringify(b.logSummary) : '[]';
      const status = b.status || 'completed';

      if (pgMdcPool) {
        await pgMdcPool.query(`
          INSERT INTO dataset_transformation_logs 
          (id, dataset_id, dataset_name, timestamp, triggered_by, province_normalization_count, year_alignment_info, sanitized_values_count, deduplicated_rows_count, log_summary_json, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT (id) DO NOTHING
        `, [id, datasetId, datasetName, timestamp, triggeredBy, provinceNormCount, yearAlignInfo, sanitizedCount, dedupCount, logSummaryJson, status]);
      } else {
        db.prepare(`
          INSERT OR REPLACE INTO dataset_transformation_logs 
          (id, dataset_id, dataset_name, timestamp, triggered_by, province_normalization_count, year_alignment_info, sanitized_values_count, deduplicated_rows_count, log_summary_json, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(id, datasetId, datasetName, timestamp, triggeredBy, provinceNormCount, yearAlignInfo, sanitizedCount, dedupCount, logSummaryJson, status);
      }

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: true, id, message: 'บันทึก Transformation Log เรียบร้อย' }));
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
    return;
  }

  // 17. GET & POST /api/pilot-sqlite/notification-settings
  if (req.method === 'GET' && (pathname === '/api/pilot-sqlite/notification-settings' || pathname === '/api/pilot-postgres/notification-settings')) {
    try {
      let row;
      if (pgMdcPool) {
        row = (await pgMdcPool.query("SELECT * FROM admin_notification_settings WHERE id = 'default'")).rows[0];
      } else {
        row = db.prepare("SELECT * FROM admin_notification_settings WHERE id = 'default'").get();
      }
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({
        ok: true,
        settings: {
          lineNotifyToken: row?.line_notify_token || '',
          emailRecipients: row?.email_recipients || '',
          notifyOnApiSuccess: row ? Boolean(row.notify_on_api_success) : true,
          notifyOnApiError: row ? Boolean(row.notify_on_api_error) : true
        }
      }));
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
    return;
  }

  if (req.method === 'POST' && (pathname === '/api/pilot-sqlite/notification-settings' || pathname === '/api/pilot-postgres/notification-settings')) {
    try {
      const b = await readJsonBody(req);
      const now = new Date().toISOString();
      const lineToken = b.lineNotifyToken || b.line_notify_token || '';
      const emailRecipients = b.emailRecipients || b.email_recipients || '';
      const notifySuccess = b.notifyOnApiSuccess !== undefined ? (b.notifyOnApiSuccess ? 1 : 0) : 1;
      const notifyError = b.notifyOnApiError !== undefined ? (b.notifyOnApiError ? 1 : 0) : 1;

      if (pgMdcPool) {
        await pgMdcPool.query(`
          INSERT INTO admin_notification_settings (id, line_notify_token, email_recipients, notify_on_api_success, notify_on_api_error, updated_at)
          VALUES ('default', $1, $2, $3, $4, $5)
          ON CONFLICT (id) DO UPDATE SET
            line_notify_token = EXCLUDED.line_notify_token,
            email_recipients = EXCLUDED.email_recipients,
            notify_on_api_success = EXCLUDED.notify_on_api_success,
            notify_on_api_error = EXCLUDED.notify_on_api_error,
            updated_at = EXCLUDED.updated_at
        `, [lineToken, emailRecipients, notifySuccess, notifyError, now]);
      } else {
        db.prepare(`
          INSERT OR REPLACE INTO admin_notification_settings (id, line_notify_token, email_recipients, notify_on_api_success, notify_on_api_error, updated_at)
          VALUES ('default', ?, ?, ?, ?, ?)
        `).run(lineToken, emailRecipients, notifySuccess, notifyError, now);
      }

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: true, message: 'บันทึกการตั้งค่าแจ้งเตือนสำเร็จ' }));
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
    return;
  }

  // 18. POST /api/pilot-sqlite/send-alert
  if (req.method === 'POST' && (pathname === '/api/pilot-sqlite/send-alert' || pathname === '/api/pilot-postgres/send-alert')) {
    try {
      const b = await readJsonBody(req);
      const subject = b.subject || '🔔 แจ้งเตือนระบบ MDC Dataset';
      const message = b.message || 'ทดสอบการส่งการแจ้งเตือนจากระบบศูนย์คุณธรรม';
      const sendResult = await sendAdminAlertNotification(subject, message);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: true, sendResult }));
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
    return;
  }

  // 19. GET & POST & DELETE /api/pilot-sqlite/synergy-initiatives
  if (req.method === 'GET' && (pathname === '/api/pilot-sqlite/synergy-initiatives' || pathname === '/api/pilot-postgres/synergy-initiatives')) {
    try {
      let rows = [];
      if (pgMdcPool) {
        rows = (await pgMdcPool.query('SELECT * FROM synergy_initiatives_registry ORDER BY updated_at DESC')).rows;
      } else {
        rows = db.prepare('SELECT * FROM synergy_initiatives_registry ORDER BY updated_at DESC').all();
      }
      const formatted = rows.map(r => ({
        id: r.id,
        domainId: r.domain_id,
        dimensionId: r.dimension_id,
        title: r.title,
        internalTableId: r.internal_table_id,
        externalTableId: r.external_table_id,
        compatibilityScore: r.compatibility_score,
        compatibilityDimensions: r.compatibility_dimensions_json ? JSON.parse(r.compatibility_dimensions_json) : null,
        isPublishedToMain: Boolean(r.is_published_to_main),
        createdAt: r.created_at,
        updatedAt: r.updated_at
      }));
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: true, initiatives: formatted }));
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
    return;
  }

  if (req.method === 'POST' && (pathname === '/api/pilot-sqlite/synergy-initiatives' || pathname === '/api/pilot-postgres/synergy-initiatives')) {
    try {
      const b = await readJsonBody(req);
      const now = new Date().toISOString();
      const id = b.id || `syn_${Date.now()}`;
      const domainId = b.domainId || b.domain_id || 'moral-index';
      const dimensionId = b.dimensionId || b.dimension_id || 'overview';
      const title = b.title || 'Synergy หัวข้อใหม่';
      const internalTableId = b.internalTableId || b.internal_table_id || '';
      const externalTableId = b.externalTableId || b.external_table_id || '';
      const score = Number(b.compatibilityScore || 0);
      const compatJson = b.compatibilityDimensions ? JSON.stringify(b.compatibilityDimensions) : null;
      const isPublished = b.isPublishedToMain ? 1 : 0;

      if (pgMdcPool) {
        await pgMdcPool.query(`
          INSERT INTO synergy_initiatives_registry 
          (id, domain_id, dimension_id, title, internal_table_id, external_table_id, compatibility_score, compatibility_dimensions_json, is_published_to_main, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            internal_table_id = EXCLUDED.internal_table_id,
            external_table_id = EXCLUDED.external_table_id,
            compatibility_score = EXCLUDED.compatibility_score,
            compatibility_dimensions_json = EXCLUDED.compatibility_dimensions_json,
            is_published_to_main = EXCLUDED.is_published_to_main,
            updated_at = EXCLUDED.updated_at
        `, [id, domainId, dimensionId, title, internalTableId, externalTableId, score, compatJson, isPublished, now, now]);
      } else {
        db.prepare(`
          INSERT OR REPLACE INTO synergy_initiatives_registry 
          (id, domain_id, dimension_id, title, internal_table_id, external_table_id, compatibility_score, compatibility_dimensions_json, is_published_to_main, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(id, domainId, dimensionId, title, internalTableId, externalTableId, score, compatJson, isPublished, now, now);
      }

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: true, id, message: 'บันทึก Synergy Initiative สำเร็จ' }));
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
    return;
  }

  if (req.method === 'DELETE' && (pathname === '/api/pilot-sqlite/synergy-initiatives' || pathname === '/api/pilot-postgres/synergy-initiatives')) {
    try {
      const id = urlObj.searchParams.get('id');
      if (id) {
        if (pgMdcPool) {
          await pgMdcPool.query('DELETE FROM synergy_initiatives_registry WHERE id = $1', [id]);
        } else {
          db.prepare('DELETE FROM synergy_initiatives_registry WHERE id = ?').run(id);
        }
      }
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: true, id, message: 'ลบ Synergy Initiative สำเร็จ' }));
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
    return;
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
      res.end(JSON.stringify({
        ok: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        sqlite: 'connected',
        postgres: pgMdcStatus,
        database: 'DB-MDC'
      }));
      return;
    }

    if (
      pathname.startsWith('/api/pilot-sqlite') ||
      pathname.startsWith('/api/pilot-postgres') ||
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

// Initialize PostgreSQL and ensure database "DB-MDC" and tables
await initPostgresMdc();

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Workshop Production Server] Listening on http://0.0.0.0:${PORT}`);
});
