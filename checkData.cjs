const { Client } = require('pg');
const connectionString = 'postgresql://postgres.qefoxpcfjjlcswqgjqtk:sUpabase26%40@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres';

const checkData = async () => {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  
  try {
    // Check tor_projects columns
    const tpCols = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'tor_projects'`);
    console.log("tor_projects columns:", tpCols.rows.map(r => r.column_name));
    
    // Check agencies columns
    const agCols = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'agencies'`);
    console.log("agencies columns:", agCols.rows.map(r => r.column_name));

    // Get a sample to see how they link
    const sample = await client.query(`SELECT id, name, agency_id FROM tor_projects LIMIT 5`);
    console.log("tor_projects sample:", sample.rows);
    
    const agenciesSample = await client.query(`SELECT id, name FROM agencies LIMIT 5`);
    console.log("agencies sample:", agenciesSample.rows);

  } catch (err) {
    console.error(err);
  }
  
  await client.end();
};
checkData();
