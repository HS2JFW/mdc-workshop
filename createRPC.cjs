const { Client } = require('pg');

const connectionString = 'postgresql://postgres.qefoxpcfjjlcswqgjqtk:sUpabase26%40@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres';

async function createRPC() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    console.log("Creating RPC function get_unique_locations...");
    await client.query(`
      CREATE OR REPLACE FUNCTION get_unique_locations()
      RETURNS TABLE (
        province VARCHAR,
        district VARCHAR,
        subdistrict VARCHAR,
        village VARCHAR
      ) AS $$
      BEGIN
        RETURN QUERY
        SELECT DISTINCT t.province, t.district, t.subdistrict, t.village
        FROM tor_projects t
        WHERE t.province IS NOT NULL;
      END;
      $$ LANGUAGE plpgsql;
    `);

    console.log("Granting execute permission...");
    await client.query(`GRANT EXECUTE ON FUNCTION get_unique_locations() TO anon, authenticated;`);

    console.log("Reloading schema...");
    await client.query(`NOTIFY pgrst, 'reload schema';`);

    console.log("RPC Function created successfully.");
  } catch (err) {
    console.error("Error creating RPC:", err);
  } finally {
    await client.end();
  }
}

createRPC();
