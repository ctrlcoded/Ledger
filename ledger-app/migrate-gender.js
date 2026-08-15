const postgres = require('postgres');

async function migrate() {
  // Try the transaction-mode pooler (port 6543) which the app uses at runtime
  const connStr = 'postgresql://postgres.aiymjagpnsidkkjdlfdo:8fN68YfWmD_%21F7m@aws-1-ap-south-1.pooler.supabase.com:6543/postgres';
  const sql = postgres(connStr, { prepare: false });
  try {
    console.log('Running migration via transaction-mode pooler (port 6543)...');
    await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender text;`;
    console.log('Migration successful: gender column added to profiles table.');
  } catch (err) {
    console.error('Migration failed:', err.message || err);
  } finally {
    await sql.end();
  }
}

migrate();
