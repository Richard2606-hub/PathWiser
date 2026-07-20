import { loadEnvConfig } from '@next/env';
import fs from 'fs';
import path from 'path';
import postgres from 'postgres';

// Load environment variables from .env.local
loadEnvConfig(process.cwd());

async function main() {
  const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  if (!dbUrl) {
    console.error('\x1b[31m%s\x1b[0m', 'Error: DATABASE_URL or SUPABASE_DB_URL is not set in environment variables.');
    console.info('\nPlease configure your .env.local file with your database connection string.');
    console.info('Example:');
    console.info('  DATABASE_URL="postgres://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"');
    console.info('\nAlternatively, you can manually apply migrations by copy-pasting the contents of:');
    console.info('  supabase/migrations/0001_init.sql');
    console.info('directly into the Supabase Dashboard SQL Editor.');
    process.exit(1);
  }

  const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '0001_init.sql');
  if (!fs.existsSync(migrationPath)) {
    console.error('\x1b[31m%s\x1b[0m', `Migration file not found at: ${migrationPath}`);
    process.exit(1);
  }

  console.log(`Reading migration file from ${migrationPath}...`);
  const sqlContent = fs.readFileSync(migrationPath, 'utf8');

  console.log('Connecting to database and running migration...');
  // Use ssl: 'require' for secure connection to Supabase
  const sql = postgres(dbUrl, { ssl: 'require' });

  try {
    await sql.unsafe(sqlContent);
    console.log('\x1b[32m%s\x1b[0m', '✓ Migration applied successfully!');
  } catch (err) {
    console.error('\x1b[31m%s\x1b[0m', 'Migration failed with error:');
    console.error(err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
