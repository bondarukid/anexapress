import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const migrationsDir = join(root, 'supabase', 'migrations');
const archiveDir = join(migrationsDir, 'archive');
const initPath = join(migrationsDir, '20250621120000_init.sql');

const errors = [];

const activeMigrations = readdirSync(migrationsDir).filter((file) => file.endsWith('.sql'));
if (activeMigrations.length !== 1 || activeMigrations[0] !== '20250621120000_init.sql') {
  errors.push(`Expected exactly one active migration, found: ${activeMigrations.join(', ')}`);
}

if (!existsSync(archiveDir)) {
  errors.push('Missing supabase/migrations/archive/');
} else {
  const archived = readdirSync(archiveDir).filter((file) => file.endsWith('.sql'));
  if (archived.length !== 35) {
    errors.push(`Expected 35 archived migrations, found ${archived.length}`);
  }
}

const initSql = readFileSync(initPath, 'utf8');
const forbiddenPatterns = [
  /\bcreate table[^\n]*workspace_integrations/i,
  /\bcreate table[^\n]*workspace_integration_tokens/i,
  /\bcreate table[^\n]*public\.projects\b/i,
  /\buser_settings\b/,
  /\bupdate public\.workspace_integrations\b/,
];

for (const pattern of forbiddenPatterns) {
  if (pattern.test(initSql)) {
    errors.push(`Forbidden pattern found: ${pattern}`);
  }
}

const requiredPatterns = [
  /create table public\.profiles/i,
  /create table if not exists public\.user_notifications/i,
  /create table if not exists public\.workspace_join_links/i,
  /create or replace function public\.handle_new_user/i,
  /create or replace function public\.create_workspace_with_owner/i,
  /create or replace function public\.prepare_user_account_deletion/i,
  /workspace-logos/,
  /supabase_realtime add table public\.user_notifications/i,
];

for (const pattern of requiredPatterns) {
  if (!pattern.test(initSql)) {
    errors.push(`Missing required pattern: ${pattern}`);
  }
}

if (errors.length > 0) {
  console.error('Init migration validation failed:');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log('Init migration validation passed.');
console.log(`Active migration: ${activeMigrations[0]} (${initSql.length} bytes)`);
console.log(`Archived migrations: ${readdirSync(archiveDir).filter((file) => file.endsWith('.sql')).length}`);
