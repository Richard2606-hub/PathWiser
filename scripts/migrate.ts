import { loadEnvConfig } from '@next/env';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import postgres from 'postgres';

loadEnvConfig(process.cwd());

async function main() {
  const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  if (!dbUrl) {
    throw new Error(
      'DATABASE_URL or SUPABASE_DB_URL is required. Use the Supabase pooler connection string; never use a public API key as a database password.'
    );
  }

  const migrationsDirectory = path.join(process.cwd(), 'supabase', 'migrations');
  const migrationFiles = fs
    .readdirSync(migrationsDirectory)
    .filter((filename) => /^\d{4}_.+\.sql$/.test(filename))
    .sort((left, right) => left.localeCompare(right));

  if (migrationFiles.length === 0) {
    throw new Error(`No migration files found in ${migrationsDirectory}`);
  }

  const sql = postgres(dbUrl, {
    ssl: 'require',
    max: 1,
    idle_timeout: 10,
    connect_timeout: 20,
  });

  try {
    await sql`select pg_advisory_lock(hashtext('pathwiser_schema_migrations'))`;
    await sql.unsafe(`
      create table if not exists public.pathwiser_schema_migrations (
        filename text primary key,
        checksum text not null,
        applied_at timestamptz not null default now()
      );
      alter table public.pathwiser_schema_migrations enable row level security;
    `);

    const appliedRows = await sql<{ filename: string; checksum: string }[]>`
      select filename, checksum
      from public.pathwiser_schema_migrations
    `;
    const applied = new Map(appliedRows.map((row) => [row.filename, row.checksum]));

    for (const filename of migrationFiles) {
      const migrationPath = path.join(migrationsDirectory, filename);
      const sqlContent = fs.readFileSync(migrationPath, 'utf8');
      const checksum = crypto.createHash('sha256').update(sqlContent).digest('hex');
      const previousChecksum = applied.get(filename);

      if (previousChecksum) {
        if (previousChecksum !== checksum) {
          throw new Error(
            `Migration ${filename} changed after it was applied. Add a new numbered migration instead of editing production history.`
          );
        }
        console.info(`skip  ${filename}`);
        continue;
      }

      console.info(`apply ${filename}`);
      await sql.begin(async (transaction) => {
        await transaction.unsafe(sqlContent);
        await transaction`
          insert into public.pathwiser_schema_migrations (filename, checksum)
          values (${filename}, ${checksum})
        `;
      });
    }

    console.info(`Applied migration set through ${migrationFiles.at(-1)}.`);
  } finally {
    await sql`select pg_advisory_unlock(hashtext('pathwiser_schema_migrations'))`.catch(() => undefined);
    await sql.end();
  }
}

main().catch((error) => {
  console.error('Migration failed:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
