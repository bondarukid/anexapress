import { readFileSync, writeFileSync, readdirSync, mkdirSync, renameSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';

const root = join(import.meta.dirname, '..');
const migrationsDir = join(root, 'supabase', 'migrations');
const archiveDir = join(migrationsDir, 'archive');
const databaseDir = join(root, 'supabase', 'DataBase');
const initPath = join(migrationsDir, '20250621120000_init.sql');
const migrationSourceDir = existsSync(archiveDir) ? archiveDir : migrationsDir;

const databaseOrder = [
  'permissions.sql',
  'profiles.sql',
  'workspaces.sql',
  'roles.sql',
  'role-permissions.sql',
  'workspace_members.sql',
  'workspace_invites.sql',
  'workspace_transfers.sql',
  'workspace_slug_history.sql',
  'subscriptions.sql',
];

const migrationOrder = [
  '20260525120000_create_workspace_with_owner_rpc.sql',
  '20260525130000_workspace_schema_rls_and_fixes.sql',
  '20260528120000_user_notifications_and_accept_invite.sql',
  '20260528140000_team_roles_and_member_notifications.sql',
  '20260528150000_lookup_invitee_profiles.sql',
  '20260528160000_fix_user_notifications_invite_unique.sql',
  '20260528170000_user_notifications_realtime.sql',
  '20260528180000_fix_notification_message_copy.sql',
  '20260528190000_notification_invite_context_rls.sql',
  '20260528200000_invite_status_realtime.sql',
  '20260528210000_realtime_replica_identity.sql',
  '20260528220000_notify_invite_declined.sql',
  '20260528230000_team_members_avatar_url.sql',
  '20260529120000_allow_multiple_owned_workspaces.sql',
  '20260529140000_workspace_join_codes_and_links.sql',
  '20260530120000_prepare_user_account_deletion.sql',
  '20260530130000_delete_solo_workspaces_on_account_deletion.sql',
  '20260530140000_rls_perf_initplan_and_consolidate.sql',
  '20260530150000_security_linter_fixes.sql',
  '20260611120000_onboarding_completed_at.sql',
  '20260612120000_workspace_logos_storage.sql',
  '20260612120000_workspace_onboarding_goals.sql',
  '20260612130000_workspace_logos_pbac.sql',
  '20260613120000_member_custom_permissions.sql',
  '20260613130000_fix_team_members_order.sql',
  '20260614120000_fix_handle_new_user_trigger.sql',
  '20260615120000_workspace_transfer_flow.sql',
  '20260617120000_workspace_timezone.sql',
  '20260618120000_profile_timezone.sql',
  '20260626120000_is_workspace_slug_available.sql',
  '20260627120000_drop_projects_and_project_analytics.sql',
  '20260629120000_fix_account_deletion_without_integrations.sql',
];

const skipMigrations = new Set([
  '20260616120000_fix_user_settings_rls_initplan.sql',
  '20260619120000_workspace_integration_tokens.sql',
  '20260628120000_drop_workspace_integrations.sql',
]);

function stripIntegrationsPermissionsSeed(sql) {
  return sql
    .replace(
      /\(\s*'integrations\.manage',\s*'Manage workspace integrations'\s*\),?\s*\n/g,
      '',
    )
    .replace(/\(\s*'appstore\.sync',\s*'Sync with app store integrations'\s*\),?\s*\n/g, '')
    .replace(/,\s*\n(\s*)on conflict \(key\) do nothing;/g, '\n$1on conflict (key) do nothing;');
}

function stripIntegrationsPermissionKeys(sql) {
  return sql
    .replace(/\s*'integrations\.manage',?\s*\n/g, '\n')
    .replace(/,(\s*\n\s*\))/g, '$1');
}

function stripWorkspaceIntegrationsAccountDeletion(sql) {
  return sql.replace(
    /\n\s*update public\.workspace_integrations\n\s*set created_by = null\n\s*where created_by = p_user_id;\n/g,
    '\n',
  );
}

function extractSecurityLinterWithoutIntegrations(content) {
  const marker = '-- ---------------------------------------------------------------------------\n-- 2. Function search_path';
  const idx = content.indexOf(marker);
  if (idx === -1) {
    throw new Error('Could not find section 2 in security_linter_fixes migration');
  }
  return content.slice(idx);
}

function extractOnboardingGoalsOnly(content) {
  const marker = '-- Remove retired onboarding goal slug from allowed values.';
  const idx = content.indexOf(marker);
  if (idx === -1) {
    throw new Error('Could not find onboarding goals section in drop_projects migration');
  }
  return content.slice(idx);
}

function extractRetiredPermissionsCleanup() {
  return `-- Remove retired integration permissions (squashed from drop_workspace_integrations)
delete from public.role_permissions rp
using public.permissions p
where rp.permission_id = p.id
  and p.key in ('integrations.manage', 'appstore.sync');

delete from public.workspace_member_permissions wmp
using public.permissions p
where wmp.permission_id = p.id
  and p.key in ('integrations.manage', 'appstore.sync');

delete from public.permissions
where key in ('integrations.manage', 'appstore.sync');
`;
}

function transformMigration(name, content) {
  if (name === '20260525130000_workspace_schema_rls_and_fixes.sql') {
    return stripIntegrationsPermissionsSeed(content);
  }

  if (name === '20260528140000_team_roles_and_member_notifications.sql') {
    return stripIntegrationsPermissionKeys(content);
  }

  if (
    name === '20260530120000_prepare_user_account_deletion.sql' ||
    name === '20260530130000_delete_solo_workspaces_on_account_deletion.sql'
  ) {
    return stripWorkspaceIntegrationsAccountDeletion(content);
  }

  if (name === '20260530150000_security_linter_fixes.sql') {
    return extractSecurityLinterWithoutIntegrations(content);
  }

  if (name === '20260627120000_drop_projects_and_project_analytics.sql') {
    return extractOnboardingGoalsOnly(content);
  }

  return content;
}

const sections = [];

sections.push(`-- Squashed init migration for fresh Supabase installs.
-- Historical incremental migrations live in supabase/migrations/archive/.
-- Generated: ${new Date().toISOString().slice(0, 10)}
`);

sections.push('-- ---------------------------------------------------------------------------\n-- Base tables (supabase/DataBase/)\n-- ---------------------------------------------------------------------------\n');

for (const file of databaseOrder) {
  const content = readFileSync(join(databaseDir, file), 'utf8').trim();
  sections.push(`-- >>> ${file}\n${content}\n`);
}

sections.push('-- ---------------------------------------------------------------------------\n-- Incremental schema (squashed from archive migrations)\n-- ---------------------------------------------------------------------------\n');

for (const name of migrationOrder) {
  if (skipMigrations.has(name)) {
    continue;
  }

  const content = readFileSync(join(migrationSourceDir, name), 'utf8').trim();
  const transformed = transformMigration(name, content);
  sections.push(`-- >>> ${name}\n${transformed}\n`);
}

sections.push('-- ---------------------------------------------------------------------------\n-- Retired permissions cleanup\n-- ---------------------------------------------------------------------------\n');
sections.push(extractRetiredPermissionsCleanup());

writeFileSync(initPath, `${sections.join('\n')}\n`, 'utf8');
console.log(`Wrote ${initPath} (${sections.join('\n').length} bytes)`);

if (migrationSourceDir === migrationsDir) {
  if (!existsSync(archiveDir)) {
    mkdirSync(archiveDir, { recursive: true });
  }

  for (const file of readdirSync(migrationsDir)) {
    if (!file.endsWith('.sql') || file === basename(initPath)) {
      continue;
    }

    renameSync(join(migrationsDir, file), join(archiveDir, file));
    console.log(`Archived ${file}`);
  }
}
