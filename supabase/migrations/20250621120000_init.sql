-- Squashed init migration for fresh Supabase installs.
-- Generated: 2026-06-21

-- >>> permissions.sql
create table public.permissions (
    id uuid not null default gen_random_uuid(),
    key text not null,
    description text null,
    constraint permissions_pkey primary key (id),
    constraint permissions_key_key unique (key)
) tablespace pg_default;

-- >>> profiles.sql
create table public.profiles (
                                 id uuid not null,
                                 first_name text null,
                                 last_name text null,
                                 company text null,
                                 position text null,
                                 created_at timestamp with time zone null default now(),
                                 updated_at timestamp with time zone null default now(),
                                 stripe_customer_id text null,
                                 accepted_terms_version text null,
                                 accepted_privacy_version text null,
                                 date_of_birth date null,
                                 avatar_url text null,
                                 mobile text null,
                                 country text null,
                                 gender text null,
                                 constraint profiles_pkey primary key (id),
                                 constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_profiles_stripe_customer_id on public.profiles using btree (stripe_customer_id) TABLESPACE pg_default
    where
    (stripe_customer_id is not null);

-- >>> workspaces.sql
create table public.workspaces (
                                   id uuid not null default gen_random_uuid (),
                                   name text not null,
                                   slug text not null,
                                   created_by uuid not null,
                                   owner_id uuid not null,
                                   logo_url text null,
                                   created_at timestamp with time zone not null default now(),
                                   updated_at timestamp with time zone not null default now(),
                                   constraint workspaces_pkey primary key (id),
                                   constraint workspaces_slug_key unique (slug),
                                   constraint workspaces_created_by_fkey foreign KEY (created_by) references auth.users (id) on delete RESTRICT,
                                   constraint workspaces_owner_id_fkey foreign KEY (owner_id) references auth.users (id) on delete RESTRICT
) TABLESPACE pg_default;

-- >>> roles.sql
create table public.roles (
                              id uuid not null default gen_random_uuid (),
                              workspace_id uuid not null,
                              slug text not null,
                              name text not null,
                              is_system boolean not null default false,
                              created_at timestamp with time zone not null default now(),
                              constraint roles_pkey primary key (id),
                              constraint roles_workspace_id_slug_key unique (workspace_id, slug),
                              constraint roles_workspace_id_fkey foreign KEY (workspace_id) references workspaces (id) on delete CASCADE
) TABLESPACE pg_default;

-- >>> role-permissions.sql
create table public.role_permissions (
                                         role_id uuid not null,
                                         permission_id uuid not null,
                                         constraint role_permissions_pkey primary key (role_id, permission_id),
                                         constraint role_permissions_role_id_fkey foreign KEY (role_id) references roles (id) on delete CASCADE,
                                         constraint role_permissions_permission_id_fkey foreign KEY (permission_id) references permissions (id) on delete CASCADE
) TABLESPACE pg_default;

-- >>> workspace_members.sql
create table public.workspace_members (
                                          id uuid not null default gen_random_uuid (),
                                          workspace_id uuid not null,
                                          user_id uuid not null,
                                          role_id uuid null,
                                          status text not null default 'active'::text,
                                          joined_at timestamp with time zone not null default now(),
                                          constraint workspace_members_pkey primary key (id),
                                          constraint workspace_members_workspace_id_user_id_key unique (workspace_id, user_id),
                                          constraint workspace_members_workspace_id_fkey foreign KEY (workspace_id) references workspaces (id) on delete CASCADE,
                                          constraint workspace_members_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

-- >>> workspace_invites.sql
create table public.workspace_invites (
                                          id uuid not null default gen_random_uuid (),
                                          workspace_id uuid not null,
                                          email text not null,
                                          role_id uuid not null,
                                          invited_by uuid not null,
                                          token text not null,
                                          status text not null default 'pending'::text,
                                          expires_at timestamp with time zone not null,
                                          created_at timestamp with time zone not null default now(),
                                          constraint workspace_invites_pkey primary key (id),
                                          constraint workspace_invites_token_key unique (token),
                                          constraint workspace_invites_invited_by_fkey foreign KEY (invited_by) references auth.users (id) on delete RESTRICT,
                                          constraint workspace_invites_workspace_id_fkey foreign KEY (workspace_id) references workspaces (id) on delete CASCADE,
                                          constraint workspace_invites_role_id_fkey foreign KEY (role_id) references roles (id) on delete RESTRICT
) TABLESPACE pg_default;

-- >>> workspace_transfers.sql
create table public.workspace_transfers (
                                            id uuid not null default gen_random_uuid (),
                                            workspace_id uuid not null,
                                            from_user_id uuid not null,
                                            to_user_id uuid not null,
                                            status text not null default 'pending'::text,
                                            token text not null,
                                            created_at timestamp with time zone not null default now(),
                                            accepted_at timestamp with time zone null,
                                            constraint workspace_transfers_pkey primary key (id),
                                            constraint workspace_transfers_token_key unique (token),
                                            constraint workspace_transfers_workspace_id_fkey foreign KEY (workspace_id) references workspaces (id) on delete CASCADE,
                                            constraint workspace_transfers_from_user_id_fkey foreign KEY (from_user_id) references auth.users (id),
                                            constraint workspace_transfers_to_user_id_fkey foreign KEY (to_user_id) references auth.users (id)
) TABLESPACE pg_default;

-- >>> workspace_slug_history.sql
create table public.workspace_slug_history (
                                               id uuid not null default gen_random_uuid (),
                                               workspace_id uuid not null,
                                               old_slug text not null,
                                               new_slug text not null,
                                               changed_at timestamp with time zone not null default now(),
                                               constraint workspace_slug_history_pkey primary key (id),
                                               constraint workspace_slug_history_workspace_id_fkey foreign KEY (workspace_id) references workspaces (id) on delete CASCADE
) TABLESPACE pg_default;

-- >>> subscriptions.sql
create table public.subscriptions (
                                      id uuid not null default gen_random_uuid (),
                                      user_id uuid not null,
                                      stripe_subscription_id text null,
                                      stripe_customer_id text null,
                                      status text not null,
                                      current_period_start timestamp with time zone null,
                                      current_period_end timestamp with time zone null,
                                      cancel_at_period_end boolean not null default false,
                                      created_at timestamp with time zone null default now(),
                                      updated_at timestamp with time zone null default now(),
                                      stripe_product_id text null,
                                      current_interval text null,
                                      constraint subscriptions_pkey primary key (id),
                                      constraint subscriptions_stripe_subscription_id_key unique (stripe_subscription_id),
                                      constraint subscriptions_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE,
                                      constraint subscriptions_current_interval_check check (
                                          (
                                              (current_interval is null)
                                                  or (
                                                  current_interval = any (array['week'::text, 'month'::text, 'year'::text])
                                                  )
                                              )
                                          ),
                                      constraint subscriptions_status_check check (
                                          (
                                              status = any (
                                                            array[
                                                                'active'::text,
                                                            'canceled'::text,
                                                            'past_due'::text,
                                                            'trialing'::text,
                                                            'incomplete'::text,
                                                            'incomplete_expired'::text,
                                                            'paused'::text,
                                                            'unpaid'::text
        ]
                                                  )
                                              )
                                          )
) TABLESPACE pg_default;

create index IF not exists idx_subscriptions_user_id on public.subscriptions using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_subscriptions_stripe_subscription_id on public.subscriptions using btree (stripe_subscription_id) TABLESPACE pg_default;

create index IF not exists idx_subscriptions_stripe_customer_id on public.subscriptions using btree (stripe_customer_id) TABLESPACE pg_default;

create index IF not exists idx_subscriptions_stripe_product_id on public.subscriptions using btree (stripe_product_id) TABLESPACE pg_default
    where
    (stripe_product_id is not null);

-- ---------------------------------------------------------------------------
-- Incremental schema (squashed from archive migrations)
-- ---------------------------------------------------------------------------

-- >>> 20260525120000_create_workspace_with_owner_rpc.sql
-- Atomic workspace creation during onboarding.
-- Apply in Supabase SQL Editor if not already present.
-- Tables (workspaces, workspace_members, roles, permissions, role_permissions, profiles)
-- must exist before running this migration.

create or replace function public.create_workspace_with_owner(
    p_name text,
    p_slug text,
    p_user_id uuid,
    p_profile jsonb default '{}'::jsonb
)
returns table (
    id uuid,
    name text,
    slug text,
    logo_url text
)
language plpgsql
security definer
set search_path = public
as $$
declare
    v_workspace_id uuid;
    v_owner_role_id uuid;
    v_permission record;
begin
    -- Caller must match the authenticated user (or service role for admin flows).
    if auth.uid() is not null and auth.uid() <> p_user_id then
        raise exception 'unauthorized';
    end if;

    -- Onboarding is only for users without existing active memberships.
    if exists (
        select 1
        from public.workspace_members wm
        where wm.user_id = p_user_id
          and wm.status = 'active'
    ) then
        raise exception 'already_has_workspace';
    end if;

    -- Slug uniqueness check before insert.
    if exists (select 1 from public.workspaces w where w.slug = p_slug) then
        raise exception 'slug_taken';
    end if;

    insert into public.workspaces (name, slug, created_by, owner_id)
    values (p_name, p_slug, p_user_id, p_user_id)
    returning workspaces.id into v_workspace_id;

    insert into public.roles (workspace_id, slug, name, is_system)
    values (v_workspace_id, 'owner', 'Owner', true)
    returning roles.id into v_owner_role_id;

    -- Grant owner all known permissions.
    for v_permission in
        select p.id from public.permissions p
    loop
        insert into public.role_permissions (role_id, permission_id)
        values (v_owner_role_id, v_permission.id)
        on conflict do nothing;
    end loop;

    insert into public.workspace_members (workspace_id, user_id, role_id, status)
    values (v_workspace_id, p_user_id, v_owner_role_id, 'active');

    -- Optional profile patch from onboarding step 1.
    if p_profile <> '{}'::jsonb then
        update public.profiles
        set
            first_name = coalesce(p_profile->>'first_name', first_name),
            last_name = coalesce(p_profile->>'last_name', last_name),
            position = coalesce(p_profile->>'position', position),
            country = coalesce(p_profile->>'country', country),
            gender = coalesce(p_profile->>'gender', gender),
            mobile = coalesce(p_profile->>'mobile', mobile)
        where profiles.id = p_user_id;
    end if;

    return query
    select w.id, w.name, w.slug, w.logo_url
    from public.workspaces w
    where w.id = v_workspace_id;
end;
$$;

revoke all on function public.create_workspace_with_owner(text, text, uuid, jsonb) from public;
grant execute on function public.create_workspace_with_owner(text, text, uuid, jsonb) to authenticated;

-- >>> 20260525130000_workspace_schema_rls_and_fixes.sql
-- Workspace schema review migration
-- Fixes: missing permissions catalog, workspace_members.role_id FK, indexes, RLS helpers + policies.
-- Safe to apply on an existing Supabase project (uses IF NOT EXISTS / conditional DO blocks).

-- ---------------------------------------------------------------------------
-- 1. Permissions catalog (referenced by role_permissions, missing from DataBase/)
-- ---------------------------------------------------------------------------
create table if not exists public.permissions (
    id uuid primary key default gen_random_uuid(),
    key text not null,
    description text null,
    constraint permissions_key_key unique (key)
);

insert into public.permissions (key, description) values
    ('workspace.read', 'View workspace settings and metadata'),
    ('workspace.update', 'Update workspace settings'),
    ('workspace.transfer', 'Initiate workspace ownership transfer'),
    ('members.invite', 'Invite members to the workspace'),
    ('members.remove', 'Remove members from the workspace'),
    ('roles.create', 'Create custom roles'),
    ('roles.update', 'Update roles and their permissions'),
    ('roles.delete', 'Delete custom roles'),
    ('content.create', 'Create content'),
    ('content.publish', 'Publish content'),
    ('content.translate', 'Translate content')
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- 2. Relationship fixes
-- ---------------------------------------------------------------------------
do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conname = 'workspace_members_role_id_fkey'
    ) then
        alter table public.workspace_members
            add constraint workspace_members_role_id_fkey
            foreign key (role_id) references public.roles (id) on delete restrict;
    end if;
end $$;

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conname = 'workspace_members_status_check'
    ) then
        alter table public.workspace_members
            add constraint workspace_members_status_check
            check (status in ('active', 'inactive', 'pending', 'suspended'));
    end if;
end $$;

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conname = 'workspace_invites_status_check'
    ) then
        alter table public.workspace_invites
            add constraint workspace_invites_status_check
            check (status in ('pending', 'accepted', 'declined', 'expired', 'revoked'));
    end if;
end $$;

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conname = 'workspace_transfers_status_check'
    ) then
        alter table public.workspace_transfers
            add constraint workspace_transfers_status_check
            check (status in ('pending', 'accepted', 'declined', 'cancelled', 'expired'));
    end if;
end $$;

-- ---------------------------------------------------------------------------
-- 3. Performance indexes
-- ---------------------------------------------------------------------------
create index if not exists idx_workspace_members_user_id
    on public.workspace_members (user_id);

create index if not exists idx_workspace_members_user_active
    on public.workspace_members (user_id)
    where status = 'active';

create index if not exists idx_workspace_members_workspace_id
    on public.workspace_members (workspace_id);

create index if not exists idx_roles_workspace_id
    on public.roles (workspace_id);

create index if not exists idx_workspace_invites_workspace_id
    on public.workspace_invites (workspace_id);

create index if not exists idx_workspace_invites_email
    on public.workspace_invites (lower(email));

create index if not exists idx_workspace_slug_history_workspace_id
    on public.workspace_slug_history (workspace_id);

create index if not exists idx_workspace_transfers_workspace_id
    on public.workspace_transfers (workspace_id);

-- ---------------------------------------------------------------------------
-- 4. updated_at helper for profiles / workspaces
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
    before update on public.profiles
    for each row execute function public.set_updated_at();

drop trigger if exists workspaces_set_updated_at on public.workspaces;
create trigger workspaces_set_updated_at
    before update on public.workspaces
    for each row execute function public.set_updated_at();

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
    before update on public.subscriptions
    for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 5. RLS helper functions (SECURITY DEFINER avoids policy recursion)
-- ---------------------------------------------------------------------------
create or replace function public.is_workspace_member(ws_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.workspace_members wm
        where wm.workspace_id = ws_id
          and wm.user_id = auth.uid()
          and wm.status = 'active'
    );
$$;

create or replace function public.is_workspace_owner(ws_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.workspaces w
        where w.id = ws_id
          and w.owner_id = auth.uid()
    );
$$;

create or replace function public.has_workspace_permission(ws_id uuid, perm_key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.workspace_members wm
        join public.roles r on r.id = wm.role_id
        join public.role_permissions rp on rp.role_id = r.id
        join public.permissions p on p.id = rp.permission_id
        where wm.workspace_id = ws_id
          and wm.user_id = auth.uid()
          and wm.status = 'active'
          and p.key = perm_key
    );
$$;

revoke all on function public.is_workspace_member(uuid) from public;
revoke all on function public.is_workspace_owner(uuid) from public;
revoke all on function public.has_workspace_permission(uuid, text) from public;

grant execute on function public.is_workspace_member(uuid) to authenticated;
grant execute on function public.is_workspace_owner(uuid) to authenticated;
grant execute on function public.has_workspace_permission(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- 6. Enable RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.workspace_invites enable row level security;
alter table public.workspace_transfers enable row level security;
alter table public.workspace_slug_history enable row level security;
alter table public.subscriptions enable row level security;

-- ---------------------------------------------------------------------------
-- 7. RLS policies
-- ---------------------------------------------------------------------------

-- profiles: own row only
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
    on public.profiles for select
    using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
    on public.profiles for insert
    with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
    on public.profiles for update
    using (auth.uid() = id)
    with check (auth.uid() = id);

-- workspaces
drop policy if exists "workspaces_select_member" on public.workspaces;
create policy "workspaces_select_member"
    on public.workspaces for select
    using (public.is_workspace_member(id));

drop policy if exists "workspaces_update_owner_or_perm" on public.workspaces;
create policy "workspaces_update_owner_or_perm"
    on public.workspaces for update
    using (
        public.is_workspace_owner(id)
        or public.has_workspace_permission(id, 'workspace.update')
    )
    with check (
        public.is_workspace_owner(id)
        or public.has_workspace_permission(id, 'workspace.update')
    );

drop policy if exists "workspaces_insert_creator" on public.workspaces;
create policy "workspaces_insert_creator"
    on public.workspaces for insert
    with check (
        auth.uid() = created_by
        and auth.uid() = owner_id
    );

-- workspace_members
drop policy if exists "workspace_members_select_member" on public.workspace_members;
create policy "workspace_members_select_member"
    on public.workspace_members for select
    using (public.is_workspace_member(workspace_id));

drop policy if exists "workspace_members_insert_invite_perm" on public.workspace_members;
create policy "workspace_members_insert_invite_perm"
    on public.workspace_members for insert
    with check (
        public.has_workspace_permission(workspace_id, 'members.invite')
        or public.is_workspace_owner(workspace_id)
    );

drop policy if exists "workspace_members_update_owner_or_perm" on public.workspace_members;
create policy "workspace_members_update_owner_or_perm"
    on public.workspace_members for update
    using (
        public.is_workspace_owner(workspace_id)
        or public.has_workspace_permission(workspace_id, 'members.remove')
    )
    with check (
        public.is_workspace_owner(workspace_id)
        or public.has_workspace_permission(workspace_id, 'members.remove')
    );

drop policy if exists "workspace_members_delete_owner_or_perm" on public.workspace_members;
create policy "workspace_members_delete_owner_or_perm"
    on public.workspace_members for delete
    using (
        public.is_workspace_owner(workspace_id)
        or public.has_workspace_permission(workspace_id, 'members.remove')
        or auth.uid() = user_id
    );

-- roles (per workspace)
drop policy if exists "roles_select_member" on public.roles;
create policy "roles_select_member"
    on public.roles for select
    using (public.is_workspace_member(workspace_id));

drop policy if exists "roles_insert_perm" on public.roles;
create policy "roles_insert_perm"
    on public.roles for insert
    with check (public.has_workspace_permission(workspace_id, 'roles.create'));

drop policy if exists "roles_update_perm" on public.roles;
create policy "roles_update_perm"
    on public.roles for update
    using (public.has_workspace_permission(workspace_id, 'roles.update'))
    with check (public.has_workspace_permission(workspace_id, 'roles.update'));

drop policy if exists "roles_delete_perm" on public.roles;
create policy "roles_delete_perm"
    on public.roles for delete
    using (
        public.has_workspace_permission(workspace_id, 'roles.delete')
        and is_system = false
    );

-- permissions catalog: readable by any authenticated user
drop policy if exists "permissions_select_authenticated" on public.permissions;
create policy "permissions_select_authenticated"
    on public.permissions for select
    to authenticated
    using (true);

-- role_permissions: visible to workspace members via role join
drop policy if exists "role_permissions_select_member" on public.role_permissions;
create policy "role_permissions_select_member"
    on public.role_permissions for select
    using (
        exists (
            select 1
            from public.roles r
            where r.id = role_permissions.role_id
              and public.is_workspace_member(r.workspace_id)
        )
    );

drop policy if exists "role_permissions_modify_perm" on public.role_permissions;
create policy "role_permissions_modify_perm"
    on public.role_permissions for all
    using (
        exists (
            select 1
            from public.roles r
            where r.id = role_permissions.role_id
              and public.has_workspace_permission(r.workspace_id, 'roles.update')
        )
    )
    with check (
        exists (
            select 1
            from public.roles r
            where r.id = role_permissions.role_id
              and public.has_workspace_permission(r.workspace_id, 'roles.update')
        )
    );

-- workspace_invites
drop policy if exists "workspace_invites_select_member" on public.workspace_invites;
create policy "workspace_invites_select_member"
    on public.workspace_invites for select
    using (
        public.is_workspace_member(workspace_id)
        or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    );

drop policy if exists "workspace_invites_insert_perm" on public.workspace_invites;
create policy "workspace_invites_insert_perm"
    on public.workspace_invites for insert
    with check (public.has_workspace_permission(workspace_id, 'members.invite'));

drop policy if exists "workspace_invites_update_perm" on public.workspace_invites;
create policy "workspace_invites_update_perm"
    on public.workspace_invites for update
    using (
        public.has_workspace_permission(workspace_id, 'members.invite')
        or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
    with check (
        public.has_workspace_permission(workspace_id, 'members.invite')
        or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    );

drop policy if exists "workspace_invites_delete_perm" on public.workspace_invites;
create policy "workspace_invites_delete_perm"
    on public.workspace_invites for delete
    using (public.has_workspace_permission(workspace_id, 'members.invite'));

-- workspace_transfers
drop policy if exists "workspace_transfers_select_parties" on public.workspace_transfers;
create policy "workspace_transfers_select_parties"
    on public.workspace_transfers for select
    using (
        public.is_workspace_owner(workspace_id)
        or auth.uid() in (from_user_id, to_user_id)
    );

drop policy if exists "workspace_transfers_insert_owner" on public.workspace_transfers;
create policy "workspace_transfers_insert_owner"
    on public.workspace_transfers for insert
    with check (
        public.is_workspace_owner(workspace_id)
        or public.has_workspace_permission(workspace_id, 'workspace.transfer')
    );

drop policy if exists "workspace_transfers_update_parties" on public.workspace_transfers;
create policy "workspace_transfers_update_parties"
    on public.workspace_transfers for update
    using (
        public.is_workspace_owner(workspace_id)
        or auth.uid() in (from_user_id, to_user_id)
    )
    with check (
        public.is_workspace_owner(workspace_id)
        or auth.uid() in (from_user_id, to_user_id)
    );

-- workspace_slug_history
drop policy if exists "workspace_slug_history_select_member" on public.workspace_slug_history;
create policy "workspace_slug_history_select_member"
    on public.workspace_slug_history for select
    using (public.is_workspace_member(workspace_id));

drop policy if exists "workspace_slug_history_insert_owner" on public.workspace_slug_history;
create policy "workspace_slug_history_insert_owner"
    on public.workspace_slug_history for insert
    with check (public.is_workspace_owner(workspace_id));

-- subscriptions: user reads own billing rows; writes via service role / webhooks
drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own"
    on public.subscriptions for select
    using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 8. Onboarding RPC (security definer — bypasses RLS for atomic setup)
-- ---------------------------------------------------------------------------
create or replace function public.create_workspace_with_owner(
    p_name text,
    p_slug text,
    p_user_id uuid,
    p_profile jsonb default '{}'::jsonb
)
returns table (
    id uuid,
    name text,
    slug text,
    logo_url text
)
language plpgsql
security definer
set search_path = public
as $$
declare
    v_workspace_id uuid;
    v_owner_role_id uuid;
    v_permission record;
begin
    if auth.uid() is not null and auth.uid() <> p_user_id then
        raise exception 'unauthorized';
    end if;

    if exists (
        select 1
        from public.workspace_members wm
        where wm.user_id = p_user_id
          and wm.status = 'active'
    ) then
        raise exception 'already_has_workspace';
    end if;

    if exists (select 1 from public.workspaces w where w.slug = p_slug) then
        raise exception 'slug_taken';
    end if;

    insert into public.workspaces (name, slug, created_by, owner_id)
    values (p_name, p_slug, p_user_id, p_user_id)
    returning workspaces.id into v_workspace_id;

    insert into public.roles (workspace_id, slug, name, is_system)
    values (v_workspace_id, 'owner', 'Owner', true)
    returning roles.id into v_owner_role_id;

    for v_permission in
        select p.id from public.permissions p
    loop
        insert into public.role_permissions (role_id, permission_id)
        values (v_owner_role_id, v_permission.id)
        on conflict do nothing;
    end loop;

    insert into public.workspace_members (workspace_id, user_id, role_id, status)
    values (v_workspace_id, p_user_id, v_owner_role_id, 'active');

    if p_profile <> '{}'::jsonb then
        update public.profiles
        set
            first_name = coalesce(p_profile->>'first_name', first_name),
            last_name = coalesce(p_profile->>'last_name', last_name),
            position = coalesce(p_profile->>'position', position),
            country = coalesce(p_profile->>'country', country),
            gender = coalesce(p_profile->>'gender', gender),
            mobile = coalesce(p_profile->>'mobile', mobile),
            updated_at = now()
        where profiles.id = p_user_id;
    end if;

    return query
    select w.id, w.name, w.slug, w.logo_url
    from public.workspaces w
    where w.id = v_workspace_id;
end;
$$;

revoke all on function public.create_workspace_with_owner(text, text, uuid, jsonb) from public;
grant execute on function public.create_workspace_with_owner(text, text, uuid, jsonb) to authenticated;

-- >>> 20260528120000_user_notifications_and_accept_invite.sql
-- User notifications center + accept workspace invite RPC

-- ---------------------------------------------------------------------------
-- user_notifications
-- ---------------------------------------------------------------------------
create table if not exists public.user_notifications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id) on delete cascade,
    kind text not null,
    title text not null,
    body text not null default '',
    read_at timestamptz null,
    invite_id uuid null references public.workspace_invites (id) on delete cascade,
    created_at timestamptz not null default now(),
    constraint user_notifications_kind_check
        check (kind in ('system', 'workspace_invite'))
);

create index if not exists idx_user_notifications_user_created
    on public.user_notifications (user_id, created_at desc);

create index if not exists idx_user_notifications_user_unread
    on public.user_notifications (user_id)
    where read_at is null;

create unique index if not exists idx_user_notifications_invite_unique
    on public.user_notifications (invite_id)
    where invite_id is not null;

alter table public.user_notifications enable row level security;

drop policy if exists "user_notifications_select_own" on public.user_notifications;
create policy "user_notifications_select_own"
    on public.user_notifications for select
    using (user_id = auth.uid());

drop policy if exists "user_notifications_insert_own" on public.user_notifications;
create policy "user_notifications_insert_own"
    on public.user_notifications for insert
    with check (user_id = auth.uid());

drop policy if exists "user_notifications_update_own" on public.user_notifications;
create policy "user_notifications_update_own"
    on public.user_notifications for update
    using (user_id = auth.uid())
    with check (user_id = auth.uid());

drop policy if exists "user_notifications_delete_own" on public.user_notifications;
create policy "user_notifications_delete_own"
    on public.user_notifications for delete
    using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Sync workspace_invites -> user_notifications on insert
-- ---------------------------------------------------------------------------
create or replace function public.sync_invite_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id uuid;
    v_workspace_name text;
    v_inviter_name text;
begin
    select u.id
    into v_user_id
    from auth.users u
    where lower(u.email) = lower(new.email)
    limit 1;

    if v_user_id is null then
        return new;
    end if;

    select w.name into v_workspace_name
    from public.workspaces w
    where w.id = new.workspace_id;

    select trim(coalesce(p.first_name, '') || ' ' || coalesce(p.last_name, ''))
    into v_inviter_name
    from public.profiles p
    where p.id = new.invited_by;

    if v_inviter_name = '' then
        v_inviter_name := 'A team member';
    end if;

    insert into public.user_notifications (
        user_id,
        kind,
        title,
        body,
        invite_id
    )
    values (
        v_user_id,
        'workspace_invite',
        'Invitation to ' || coalesce(v_workspace_name, 'a workspace'),
        v_inviter_name || ' invited you to join ' || coalesce(v_workspace_name, 'their workspace') || '.',
        new.id
    )
    on conflict (invite_id) where invite_id is not null do nothing;

    return new;
end;
$$;

drop trigger if exists trg_workspace_invites_sync_notification on public.workspace_invites;
create trigger trg_workspace_invites_sync_notification
    after insert on public.workspace_invites
    for each row
    execute function public.sync_invite_notification();

-- ---------------------------------------------------------------------------
-- accept_workspace_invite RPC
-- ---------------------------------------------------------------------------
create or replace function public.accept_workspace_invite(p_invite_id uuid)
returns table (
    workspace_id uuid,
    workspace_name text,
    workspace_slug text
)
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id uuid;
    v_user_email text;
    v_invite record;
begin
    v_user_id := auth.uid();
    if v_user_id is null then
        raise exception 'unauthorized';
    end if;

    select lower(u.email) into v_user_email
    from auth.users u
    where u.id = v_user_id;

    if v_user_email is null then
        raise exception 'unauthorized';
    end if;

    select
        wi.id,
        wi.workspace_id,
        wi.email,
        wi.role_id,
        wi.status,
        wi.expires_at
    into v_invite
    from public.workspace_invites wi
    where wi.id = p_invite_id
    for update;

    if v_invite.id is null then
        raise exception 'invite_not_found';
    end if;

    if v_invite.status <> 'pending' then
        raise exception 'invite_not_pending';
    end if;

    if v_invite.expires_at <= now() then
        update public.workspace_invites
        set status = 'expired'
        where id = p_invite_id;
        raise exception 'invite_expired';
    end if;

    if lower(v_invite.email) <> v_user_email then
        raise exception 'invite_email_mismatch';
    end if;

    if exists (
        select 1
        from public.workspace_members wm
        where wm.workspace_id = v_invite.workspace_id
          and wm.user_id = v_user_id
          and wm.status = 'active'
    ) then
        raise exception 'already_member';
    end if;

    insert into public.workspace_members (workspace_id, user_id, role_id, status)
    values (v_invite.workspace_id, v_user_id, v_invite.role_id, 'active');

    update public.workspace_invites
    set status = 'accepted'
    where id = p_invite_id;

    delete from public.user_notifications
    where invite_id = p_invite_id
      and user_id = v_user_id;

    return query
    select w.id, w.name, w.slug
    from public.workspaces w
    where w.id = v_invite.workspace_id;
end;
$$;

revoke all on function public.accept_workspace_invite(uuid) from public;
grant execute on function public.accept_workspace_invite(uuid) to authenticated;

-- >>> 20260528140000_team_roles_and_member_notifications.sql
-- Default workspace roles, team member visibility, and member-management notifications.

-- ---------------------------------------------------------------------------
-- Notification kinds (system subtypes + workspace_invite)
-- ---------------------------------------------------------------------------
alter table public.user_notifications
    drop constraint if exists user_notifications_kind_check;

alter table public.user_notifications
    add constraint user_notifications_kind_check
    check (kind in (
        'workspace_invite',
        'system.invite_sent',
        'system.invite_revoked',
        'system.invite_revoked_invitee',
        'system.invite_accepted'
    ));

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.insert_user_notification(
    p_user_id uuid,
    p_kind text,
    p_title text,
    p_body text,
    p_invite_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    if p_user_id is null then
        return;
    end if;

    insert into public.user_notifications (user_id, kind, title, body, invite_id)
    values (p_user_id, p_kind, p_title, p_body, p_invite_id);
end;
$$;

revoke all on function public.insert_user_notification(uuid, text, text, text, uuid) from public;
grant execute on function public.insert_user_notification(uuid, text, text, text, uuid) to authenticated;

-- Workspace peers may read each other's profile names (team list).
drop policy if exists "profiles_select_workspace_peer" on public.profiles;
create policy "profiles_select_workspace_peer"
    on public.profiles for select
    using (
        exists (
            select 1
            from public.workspace_members wm_self
            join public.workspace_members wm_peer
                on wm_peer.workspace_id = wm_self.workspace_id
            where wm_self.user_id = auth.uid()
              and wm_peer.user_id = profiles.id
              and wm_self.status = 'active'
              and wm_peer.status = 'active'
        )
    );

-- ---------------------------------------------------------------------------
-- Ensure default assignable roles exist per workspace
-- ---------------------------------------------------------------------------
create or replace function public.ensure_workspace_system_roles(p_workspace_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    v_role_id uuid;
    v_perm_id uuid;
begin
    if not exists (select 1 from public.workspaces w where w.id = p_workspace_id) then
        return;
    end if;

    -- admin
    insert into public.roles (workspace_id, slug, name, is_system)
    values (p_workspace_id, 'admin', 'Admin', true)
    on conflict (workspace_id, slug) do nothing;

    select id into v_role_id
    from public.roles
    where workspace_id = p_workspace_id and slug = 'admin';

    for v_perm_id in
        select p.id from public.permissions p
        where p.key in (
            'workspace.read',
            'workspace.update',
            'members.invite',
            'members.remove',
            'roles.create',
            'roles.update',
            'roles.delete',
            'content.create',
            'content.publish',
            'content.translate'
        )
    loop
        insert into public.role_permissions (role_id, permission_id)
        values (v_role_id, v_perm_id)
        on conflict do nothing;
    end loop;

    -- editor
    insert into public.roles (workspace_id, slug, name, is_system)
    values (p_workspace_id, 'editor', 'Editor', true)
    on conflict (workspace_id, slug) do nothing;

    select id into v_role_id
    from public.roles
    where workspace_id = p_workspace_id and slug = 'editor';

    for v_perm_id in
        select p.id from public.permissions p
        where p.key in ('workspace.read', 'content.create')
    loop
        insert into public.role_permissions (role_id, permission_id)
        values (v_role_id, v_perm_id)
        on conflict do nothing;
    end loop;

    -- publisher
    insert into public.roles (workspace_id, slug, name, is_system)
    values (p_workspace_id, 'publisher', 'Publisher', true)
    on conflict (workspace_id, slug) do nothing;

    select id into v_role_id
    from public.roles
    where workspace_id = p_workspace_id and slug = 'publisher';

    for v_perm_id in
        select p.id from public.permissions p
        where p.key in ('workspace.read', 'content.create', 'content.publish')
    loop
        insert into public.role_permissions (role_id, permission_id)
        values (v_role_id, v_perm_id)
        on conflict do nothing;
    end loop;

    -- translator
    insert into public.roles (workspace_id, slug, name, is_system)
    values (p_workspace_id, 'translator', 'Translator', true)
    on conflict (workspace_id, slug) do nothing;

    select id into v_role_id
    from public.roles
    where workspace_id = p_workspace_id and slug = 'translator';

    for v_perm_id in
        select p.id from public.permissions p
        where p.key in ('workspace.read', 'content.translate')
    loop
        insert into public.role_permissions (role_id, permission_id)
        values (v_role_id, v_perm_id)
        on conflict do nothing;
    end loop;

    -- viewer
    insert into public.roles (workspace_id, slug, name, is_system)
    values (p_workspace_id, 'viewer', 'Viewer', true)
    on conflict (workspace_id, slug) do nothing;

    select id into v_role_id
    from public.roles
    where workspace_id = p_workspace_id and slug = 'viewer';

    for v_perm_id in
        select p.id from public.permissions p
        where p.key = 'workspace.read'
    loop
        insert into public.role_permissions (role_id, permission_id)
        values (v_role_id, v_perm_id)
        on conflict do nothing;
    end loop;
end;
$$;

revoke all on function public.ensure_workspace_system_roles(uuid) from public;
grant execute on function public.ensure_workspace_system_roles(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Team list RPC (emails via auth.users)
-- ---------------------------------------------------------------------------
create or replace function public.get_workspace_team_members(p_workspace_id uuid)
returns table (
    membership_id uuid,
    user_id uuid,
    email text,
    first_name text,
    last_name text,
    role_id uuid,
    role_slug text,
    role_name text,
    is_workspace_owner boolean
)
language plpgsql
security definer
set search_path = public
as $$
begin
    if not public.is_workspace_member(p_workspace_id) then
        raise exception 'forbidden';
    end if;

    perform public.ensure_workspace_system_roles(p_workspace_id);

    return query
    select
        wm.id,
        wm.user_id,
        u.email::text,
        p.first_name,
        p.last_name,
        r.id,
        r.slug,
        r.name,
        (w.owner_id = wm.user_id)
    from public.workspace_members wm
    join auth.users u on u.id = wm.user_id
    left join public.profiles p on p.id = wm.user_id
    join public.roles r on r.id = wm.role_id
    join public.workspaces w on w.id = wm.workspace_id
    where wm.workspace_id = p_workspace_id
      and wm.status = 'active'
    order by (w.owner_id = wm.user_id) desc, wm.joined_at asc;
end;
$$;

revoke all on function public.get_workspace_team_members(uuid) from public;
grant execute on function public.get_workspace_team_members(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Inviter notification on invite created
-- ---------------------------------------------------------------------------
create or replace function public.notify_invite_sent()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    v_workspace_name text;
begin
    select w.name into v_workspace_name
    from public.workspaces w
    where w.id = new.workspace_id;

    perform public.insert_user_notification(
        new.invited_by,
        'system.invite_sent',
        'Invitation sent',
        'You invited ' || new.email || ' to ' || coalesce(v_workspace_name, 'your workspace') || '.',
        new.id
    );

    return new;
end;
$$;

drop trigger if exists trg_workspace_invites_notify_sent on public.workspace_invites;
create trigger trg_workspace_invites_notify_sent
    after insert on public.workspace_invites
    for each row
    when (new.status = 'pending')
    execute function public.notify_invite_sent();

-- ---------------------------------------------------------------------------
-- Notifications when invite is revoked
-- ---------------------------------------------------------------------------
create or replace function public.notify_invite_revoked()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id uuid;
    v_workspace_name text;
begin
    if new.status is distinct from old.status
       and new.status = 'revoked'
       and old.status = 'pending' then

        select w.name into v_workspace_name
        from public.workspaces w
        where w.id = new.workspace_id;

        select u.id into v_user_id
        from auth.users u
        where lower(u.email) = lower(new.email)
        limit 1;

        delete from public.user_notifications
        where invite_id = new.id
          and kind = 'workspace_invite';

        if v_user_id is not null then
            perform public.insert_user_notification(
                v_user_id,
                'system.invite_revoked_invitee',
                'Invitation withdrawn',
                'Your invitation to ' || coalesce(v_workspace_name, 'the workspace') || ' was withdrawn.',
                new.id
            );
        end if;

        perform public.insert_user_notification(
            new.invited_by,
            'system.invite_revoked',
            'Invitation withdrawn',
            'You withdrew the invitation for ' || new.email || '.',
            new.id
        );
    end if;

    return new;
end;
$$;

drop trigger if exists trg_workspace_invites_notify_revoked on public.workspace_invites;
create trigger trg_workspace_invites_notify_revoked
    after update on public.workspace_invites
    for each row
    execute function public.notify_invite_revoked();

-- ---------------------------------------------------------------------------
-- accept_workspace_invite: notify inviter on accept
-- ---------------------------------------------------------------------------
create or replace function public.accept_workspace_invite(p_invite_id uuid)
returns table (
    workspace_id uuid,
    workspace_name text,
    workspace_slug text
)
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id uuid;
    v_user_email text;
    v_invite record;
    v_accepter_name text;
    v_workspace_name text;
begin
    v_user_id := auth.uid();
    if v_user_id is null then
        raise exception 'unauthorized';
    end if;

    select lower(u.email) into v_user_email
    from auth.users u
    where u.id = v_user_id;

    if v_user_email is null then
        raise exception 'unauthorized';
    end if;

    select
        wi.id,
        wi.workspace_id,
        wi.email,
        wi.role_id,
        wi.status,
        wi.expires_at,
        wi.invited_by
    into v_invite
    from public.workspace_invites wi
    where wi.id = p_invite_id
    for update;

    if v_invite.id is null then
        raise exception 'invite_not_found';
    end if;

    if v_invite.status <> 'pending' then
        raise exception 'invite_not_pending';
    end if;

    if v_invite.expires_at <= now() then
        update public.workspace_invites
        set status = 'expired'
        where id = p_invite_id;
        raise exception 'invite_expired';
    end if;

    if lower(v_invite.email) <> v_user_email then
        raise exception 'invite_email_mismatch';
    end if;

    if exists (
        select 1
        from public.workspace_members wm
        where wm.workspace_id = v_invite.workspace_id
          and wm.user_id = v_user_id
          and wm.status = 'active'
    ) then
        raise exception 'already_member';
    end if;

    insert into public.workspace_members (workspace_id, user_id, role_id, status)
    values (v_invite.workspace_id, v_user_id, v_invite.role_id, 'active');

    update public.workspace_invites
    set status = 'accepted'
    where id = p_invite_id;

    delete from public.user_notifications
    where invite_id = p_invite_id
      and user_id = v_user_id;

    select trim(coalesce(p.first_name, '') || ' ' || coalesce(p.last_name, ''))
    into v_accepter_name
    from public.profiles p
    where p.id = v_user_id;

    if v_accepter_name = '' then
        v_accepter_name := v_invite.email;
    end if;

    select w.name into v_workspace_name
    from public.workspaces w
    where w.id = v_invite.workspace_id;

    perform public.insert_user_notification(
        v_invite.invited_by,
        'system.invite_accepted',
        'Invitation accepted',
        v_accepter_name || ' accepted your invitation to ' || coalesce(v_workspace_name, 'your workspace') || '.',
        p_invite_id
    );

    return query
    select w.id, w.name, w.slug
    from public.workspaces w
    where w.id = v_invite.workspace_id;
end;
$$;

revoke all on function public.accept_workspace_invite(uuid) from public;
grant execute on function public.accept_workspace_invite(uuid) to authenticated;

-- >>> 20260528150000_lookup_invitee_profiles.sql
-- Resolve registered SaaS users by email (pending invites / team UI).

create or replace function public.lookup_saas_users_by_emails(
    p_workspace_id uuid,
    p_emails text[]
)
returns table (
    email text,
    user_id uuid,
    first_name text,
    last_name text,
    avatar_url text
)
language plpgsql
security definer
set search_path = public
as $$
begin
    if not public.is_workspace_member(p_workspace_id) then
        raise exception 'forbidden';
    end if;

    if p_emails is null or cardinality(p_emails) = 0 then
        return;
    end if;

    return query
    select
        lower(u.email)::text,
        u.id,
        p.first_name,
        p.last_name,
        p.avatar_url
    from auth.users u
    left join public.profiles p on p.id = u.id
    where lower(u.email) = any (
        select lower(trim(e))
        from unnest(p_emails) as e
        where trim(e) <> ''
    );
end;
$$;

revoke all on function public.lookup_saas_users_by_emails(uuid, text[]) from public;
grant execute on function public.lookup_saas_users_by_emails(uuid, text[]) to authenticated;

-- >>> 20260528160000_fix_user_notifications_invite_unique.sql
-- Fix: one row per (user_id, invite_id, kind), not per invite_id globally.
-- Previously system.invite_sent and workspace_invite shared invite_id and violated
-- idx_user_notifications_invite_unique, rolling back the whole invite insert.

drop index if exists public.idx_user_notifications_invite_unique;

create unique index if not exists idx_user_notifications_user_invite_kind_unique
    on public.user_notifications (user_id, invite_id, kind)
    where invite_id is not null;

-- ---------------------------------------------------------------------------
-- sync_invite_notification (invitee workspace_invite)
-- ---------------------------------------------------------------------------
create or replace function public.sync_invite_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id uuid;
    v_workspace_name text;
    v_inviter_name text;
begin
    select u.id
    into v_user_id
    from auth.users u
    where lower(u.email) = lower(new.email)
    limit 1;

    if v_user_id is null then
        return new;
    end if;

    select w.name into v_workspace_name
    from public.workspaces w
    where w.id = new.workspace_id;

    select trim(coalesce(p.first_name, '') || ' ' || coalesce(p.last_name, ''))
    into v_inviter_name
    from public.profiles p
    where p.id = new.invited_by;

    if v_inviter_name = '' then
        v_inviter_name := 'A team member';
    end if;

    insert into public.user_notifications (
        user_id,
        kind,
        title,
        body,
        invite_id
    )
    values (
        v_user_id,
        'workspace_invite',
        'Invitation to ' || coalesce(v_workspace_name, 'a workspace'),
        v_inviter_name || ' invited you to join ' || coalesce(v_workspace_name, 'their workspace') || '.',
        new.id
    )
    on conflict (user_id, invite_id, kind)
    where invite_id is not null
    do nothing;

    return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- insert_user_notification (system + other definer inserts)
-- ---------------------------------------------------------------------------
create or replace function public.insert_user_notification(
    p_user_id uuid,
    p_kind text,
    p_title text,
    p_body text,
    p_invite_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    if p_user_id is null then
        return;
    end if;

    if p_invite_id is null then
        insert into public.user_notifications (user_id, kind, title, body, invite_id)
        values (p_user_id, p_kind, p_title, p_body, null);
        return;
    end if;

    insert into public.user_notifications (user_id, kind, title, body, invite_id)
    values (p_user_id, p_kind, p_title, p_body, p_invite_id)
    on conflict (user_id, invite_id, kind)
    where invite_id is not null
    do nothing;
end;
$$;

-- ---------------------------------------------------------------------------
-- accept_workspace_invite: remove only the actionable invite notification
-- ---------------------------------------------------------------------------
create or replace function public.accept_workspace_invite(p_invite_id uuid)
returns table (
    workspace_id uuid,
    workspace_name text,
    workspace_slug text
)
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id uuid;
    v_user_email text;
    v_invite record;
    v_accepter_name text;
    v_workspace_name text;
begin
    v_user_id := auth.uid();
    if v_user_id is null then
        raise exception 'unauthorized';
    end if;

    select lower(u.email) into v_user_email
    from auth.users u
    where u.id = v_user_id;

    if v_user_email is null then
        raise exception 'unauthorized';
    end if;

    select
        wi.id,
        wi.workspace_id,
        wi.email,
        wi.role_id,
        wi.status,
        wi.expires_at,
        wi.invited_by
    into v_invite
    from public.workspace_invites wi
    where wi.id = p_invite_id
    for update;

    if v_invite.id is null then
        raise exception 'invite_not_found';
    end if;

    if v_invite.status <> 'pending' then
        raise exception 'invite_not_pending';
    end if;

    if v_invite.expires_at <= now() then
        update public.workspace_invites
        set status = 'expired'
        where id = p_invite_id;
        raise exception 'invite_expired';
    end if;

    if lower(v_invite.email) <> v_user_email then
        raise exception 'invite_email_mismatch';
    end if;

    if exists (
        select 1
        from public.workspace_members wm
        where wm.workspace_id = v_invite.workspace_id
          and wm.user_id = v_user_id
          and wm.status = 'active'
    ) then
        raise exception 'already_member';
    end if;

    insert into public.workspace_members (workspace_id, user_id, role_id, status)
    values (v_invite.workspace_id, v_user_id, v_invite.role_id, 'active');

    update public.workspace_invites
    set status = 'accepted'
    where id = p_invite_id;

    delete from public.user_notifications
    where invite_id = p_invite_id
      and user_id = v_user_id
      and kind = 'workspace_invite';

    select trim(coalesce(p.first_name, '') || ' ' || coalesce(p.last_name, ''))
    into v_accepter_name
    from public.profiles p
    where p.id = v_user_id;

    if v_accepter_name = '' then
        v_accepter_name := v_invite.email;
    end if;

    select w.name into v_workspace_name
    from public.workspaces w
    where w.id = v_invite.workspace_id;

    perform public.insert_user_notification(
        v_invite.invited_by,
        'system.invite_accepted',
        'Invitation accepted',
        v_accepter_name || ' accepted your invitation to ' || coalesce(v_workspace_name, 'your workspace') || '.',
        p_invite_id
    );

    return query
    select w.id, w.name, w.slug
    from public.workspaces w
    where w.id = v_invite.workspace_id;
end;
$$;

revoke all on function public.accept_workspace_invite(uuid) from public;
grant execute on function public.accept_workspace_invite(uuid) to authenticated;

-- >>> 20260528170000_user_notifications_realtime.sql
-- Enable Realtime for in-app notification delivery.

do $$
begin
    if not exists (
        select 1
        from pg_publication_tables
        where pubname = 'supabase_realtime'
          and schemaname = 'public'
          and tablename = 'user_notifications'
    ) then
        alter publication supabase_realtime add table public.user_notifications;
    end if;
end $$;

-- >>> 20260528180000_fix_notification_message_copy.sql
-- Fix notification copy: inviter vs invitee vs workspace names in titles/bodies.

-- ---------------------------------------------------------------------------
-- Display name helpers
-- ---------------------------------------------------------------------------
create or replace function public.notification_user_name(p_user_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
    select coalesce(
        nullif(trim(coalesce(p.first_name, '') || ' ' || coalesce(p.last_name, '')), ''),
        'A team member'
    )
    from public.profiles p
    where p.id = p_user_id;
$$;

create or replace function public.notification_invitee_name(p_email text)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
    v_name text;
begin
    select trim(coalesce(p.first_name, '') || ' ' || coalesce(p.last_name, ''))
    into v_name
    from auth.users u
    left join public.profiles p on p.id = u.id
    where lower(u.email) = lower(p_email)
    limit 1;

    if v_name is not null and v_name <> '' then
        return v_name;
    end if;

    return initcap(replace(split_part(p_email, '@', 1), '.', ' '));
end;
$$;

revoke all on function public.notification_user_name(uuid) from public;
revoke all on function public.notification_invitee_name(text) from public;
grant execute on function public.notification_user_name(uuid) to authenticated;
grant execute on function public.notification_invitee_name(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Invitee: workspace_invite on insert
-- ---------------------------------------------------------------------------
create or replace function public.sync_invite_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id uuid;
    v_workspace_name text;
    v_inviter_name text;
begin
    select u.id
    into v_user_id
    from auth.users u
    where lower(u.email) = lower(new.email)
    limit 1;

    if v_user_id is null then
        return new;
    end if;

    select w.name into v_workspace_name
    from public.workspaces w
    where w.id = new.workspace_id;

    v_inviter_name := public.notification_user_name(new.invited_by);

    insert into public.user_notifications (
        user_id,
        kind,
        title,
        body,
        invite_id
    )
    values (
        v_user_id,
        'workspace_invite',
        v_inviter_name || ' invited you',
        v_inviter_name || ' invited you to join ' || coalesce(v_workspace_name, 'a workspace') || '.',
        new.id
    )
    on conflict (user_id, invite_id, kind)
    where invite_id is not null
    do nothing;

    return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Inviter: invitation sent
-- ---------------------------------------------------------------------------
create or replace function public.notify_invite_sent()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    v_workspace_name text;
    v_invitee_name text;
begin
    select w.name into v_workspace_name
    from public.workspaces w
    where w.id = new.workspace_id;

    v_invitee_name := public.notification_invitee_name(new.email);

    perform public.insert_user_notification(
        new.invited_by,
        'system.invite_sent',
        'Invitation to ' || v_invitee_name,
        'You invited ' || v_invitee_name || ' to join ' || coalesce(v_workspace_name, 'your workspace') || '.',
        new.id
    );

    return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Revoked: invitee + inviter
-- ---------------------------------------------------------------------------
create or replace function public.notify_invite_revoked()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id uuid;
    v_workspace_name text;
    v_inviter_name text;
    v_invitee_name text;
begin
    if new.status is distinct from old.status
       and new.status = 'revoked'
       and old.status = 'pending' then

        select w.name into v_workspace_name
        from public.workspaces w
        where w.id = new.workspace_id;

        v_inviter_name := public.notification_user_name(new.invited_by);
        v_invitee_name := public.notification_invitee_name(new.email);

        select u.id into v_user_id
        from auth.users u
        where lower(u.email) = lower(new.email)
        limit 1;

        delete from public.user_notifications
        where invite_id = new.id
          and kind = 'workspace_invite';

        if v_user_id is not null then
            perform public.insert_user_notification(
                v_user_id,
                'system.invite_revoked_invitee',
                'Invitation withdrawn',
                v_inviter_name || ' withdrew your invitation to join ' || coalesce(v_workspace_name, 'the workspace') || '.',
                new.id
            );
        end if;

        perform public.insert_user_notification(
            new.invited_by,
            'system.invite_revoked',
            'Invitation withdrawn',
            'You withdrew the invitation for ' || v_invitee_name || '.',
            new.id
        );
    end if;

    return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Accepted: notify inviter (body already uses accepter name)
-- ---------------------------------------------------------------------------
create or replace function public.accept_workspace_invite(p_invite_id uuid)
returns table (
    workspace_id uuid,
    workspace_name text,
    workspace_slug text
)
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id uuid;
    v_user_email text;
    v_invite record;
    v_accepter_name text;
    v_workspace_name text;
begin
    v_user_id := auth.uid();
    if v_user_id is null then
        raise exception 'unauthorized';
    end if;

    select lower(u.email) into v_user_email
    from auth.users u
    where u.id = v_user_id;

    if v_user_email is null then
        raise exception 'unauthorized';
    end if;

    select
        wi.id,
        wi.workspace_id,
        wi.email,
        wi.role_id,
        wi.status,
        wi.expires_at,
        wi.invited_by
    into v_invite
    from public.workspace_invites wi
    where wi.id = p_invite_id
    for update;

    if v_invite.id is null then
        raise exception 'invite_not_found';
    end if;

    if v_invite.status <> 'pending' then
        raise exception 'invite_not_pending';
    end if;

    if v_invite.expires_at <= now() then
        update public.workspace_invites
        set status = 'expired'
        where id = p_invite_id;
        raise exception 'invite_expired';
    end if;

    if lower(v_invite.email) <> v_user_email then
        raise exception 'invite_email_mismatch';
    end if;

    if exists (
        select 1
        from public.workspace_members wm
        where wm.workspace_id = v_invite.workspace_id
          and wm.user_id = v_user_id
          and wm.status = 'active'
    ) then
        raise exception 'already_member';
    end if;

    insert into public.workspace_members (workspace_id, user_id, role_id, status)
    values (v_invite.workspace_id, v_user_id, v_invite.role_id, 'active');

    update public.workspace_invites
    set status = 'accepted'
    where id = p_invite_id;

    delete from public.user_notifications
    where invite_id = p_invite_id
      and user_id = v_user_id
      and kind = 'workspace_invite';

    v_accepter_name := public.notification_invitee_name(v_invite.email);

    select w.name into v_workspace_name
    from public.workspaces w
    where w.id = v_invite.workspace_id;

    perform public.insert_user_notification(
        v_invite.invited_by,
        'system.invite_accepted',
        'Invitation accepted',
        v_accepter_name || ' accepted your invitation to join ' || coalesce(v_workspace_name, 'your workspace') || '.',
        p_invite_id
    );

    return query
    select w.id, w.name, w.slug
    from public.workspaces w
    where w.id = v_invite.workspace_id;
end;
$$;

revoke all on function public.accept_workspace_invite(uuid) from public;
grant execute on function public.accept_workspace_invite(uuid) to authenticated;

-- >>> 20260528190000_notification_invite_context_rls.sql
-- Invitees can read workspace + inviter profile for their invitations (notifications UI).

drop policy if exists "workspaces_select_member" on public.workspaces;
create policy "workspaces_select_member"
    on public.workspaces for select
    using (
        public.is_workspace_member(id)
        or exists (
            select 1
            from public.workspace_invites wi
            where wi.workspace_id = workspaces.id
              and lower(wi.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
        )
    );

drop policy if exists "profiles_select_pending_inviter" on public.profiles;
create policy "profiles_select_pending_inviter"
    on public.profiles for select
    using (
        exists (
            select 1
            from public.workspace_invites wi
            where wi.invited_by = profiles.id
              and lower(wi.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
        )
    );

-- >>> 20260528200000_invite_status_realtime.sql
-- Realtime when invites are accepted/declined/revoked and members join.

do $$
begin
    if not exists (
        select 1
        from pg_publication_tables
        where pubname = 'supabase_realtime'
          and schemaname = 'public'
          and tablename = 'workspace_invites'
    ) then
        alter publication supabase_realtime add table public.workspace_invites;
    end if;

    if not exists (
        select 1
        from pg_publication_tables
        where pubname = 'supabase_realtime'
          and schemaname = 'public'
          and tablename = 'workspace_members'
    ) then
        alter publication supabase_realtime add table public.workspace_members;
    end if;
end $$;

-- >>> 20260528210000_realtime_replica_identity.sql
-- Realtime UPDATE/DELETE payloads need full old row (e.g. workspace_invites.status).

alter table public.workspace_invites replica identity full;
alter table public.workspace_members replica identity full;
alter table public.user_notifications replica identity full;

-- >>> 20260528220000_notify_invite_declined.sql
-- Notify inviter when invitee declines (team page can refresh via user_notifications realtime).

alter table public.user_notifications
    drop constraint if exists user_notifications_kind_check;

alter table public.user_notifications
    add constraint user_notifications_kind_check
    check (kind in (
        'workspace_invite',
        'system.invite_sent',
        'system.invite_revoked',
        'system.invite_revoked_invitee',
        'system.invite_accepted',
        'system.invite_declined'
    ));

create or replace function public.notify_invite_declined()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    v_workspace_name text;
    v_invitee_name text;
begin
    if new.status is distinct from old.status
       and new.status = 'declined'
       and old.status = 'pending' then

        select w.name into v_workspace_name
        from public.workspaces w
        where w.id = new.workspace_id;

        v_invitee_name := public.notification_invitee_name(new.email);

        perform public.insert_user_notification(
            new.invited_by,
            'system.invite_declined',
            'Invitation declined',
            v_invitee_name || ' declined your invitation to join '
                || coalesce(v_workspace_name, 'the workspace') || '.',
            new.id
        );
    end if;

    return new;
end;
$$;

drop trigger if exists trg_workspace_invites_notify_declined on public.workspace_invites;
create trigger trg_workspace_invites_notify_declined
    after update on public.workspace_invites
    for each row
    execute function public.notify_invite_declined();

-- >>> 20260528230000_team_members_avatar_url.sql
-- Expose profile avatars in the team members list RPC.

drop function if exists public.get_workspace_team_members(uuid);

create or replace function public.get_workspace_team_members(p_workspace_id uuid)
returns table (
    membership_id uuid,
    user_id uuid,
    email text,
    first_name text,
    last_name text,
    avatar_url text,
    role_id uuid,
    role_slug text,
    role_name text,
    is_workspace_owner boolean
)
language plpgsql
security definer
set search_path = public
as $$
begin
    if not public.is_workspace_member(p_workspace_id) then
        raise exception 'forbidden';
    end if;

    perform public.ensure_workspace_system_roles(p_workspace_id);

    return query
    select
        wm.id,
        wm.user_id,
        u.email::text,
        p.first_name,
        p.last_name,
        p.avatar_url,
        r.id,
        r.slug,
        r.name,
        (w.owner_id = wm.user_id)
    from public.workspace_members wm
    join auth.users u on u.id = wm.user_id
    left join public.profiles p on p.id = wm.user_id
    join public.roles r on r.id = wm.role_id
    join public.workspaces w on w.id = wm.workspace_id
    where wm.workspace_id = p_workspace_id
      and wm.status = 'active'
    order by (w.owner_id = wm.user_id) desc, wm.joined_at asc;
end;
$$;

revoke all on function public.get_workspace_team_members(uuid) from public;
grant execute on function public.get_workspace_team_members(uuid) to authenticated;

-- >>> 20260529120000_allow_multiple_owned_workspaces.sql
-- Allow users to create additional owned workspaces (not only the first via onboarding).

create or replace function public.create_workspace_with_owner(
    p_name text,
    p_slug text,
    p_user_id uuid,
    p_profile jsonb default '{}'::jsonb
)
returns table (
    id uuid,
    name text,
    slug text,
    logo_url text
)
language plpgsql
security definer
set search_path = public
as $$
declare
    v_workspace_id uuid;
    v_owner_role_id uuid;
    v_permission record;
begin
    if auth.uid() is not null and auth.uid() <> p_user_id then
        raise exception 'unauthorized';
    end if;

    if exists (select 1 from public.workspaces w where w.slug = p_slug) then
        raise exception 'slug_taken';
    end if;

    insert into public.workspaces (name, slug, created_by, owner_id)
    values (p_name, p_slug, p_user_id, p_user_id)
    returning workspaces.id into v_workspace_id;

    insert into public.roles (workspace_id, slug, name, is_system)
    values (v_workspace_id, 'owner', 'Owner', true)
    returning roles.id into v_owner_role_id;

    for v_permission in
        select p.id from public.permissions p
    loop
        insert into public.role_permissions (role_id, permission_id)
        values (v_owner_role_id, v_permission.id)
        on conflict do nothing;
    end loop;

    insert into public.workspace_members (workspace_id, user_id, role_id, status)
    values (v_workspace_id, p_user_id, v_owner_role_id, 'active');

    if p_profile <> '{}'::jsonb then
        update public.profiles
        set
            first_name = coalesce(p_profile->>'first_name', first_name),
            last_name = coalesce(p_profile->>'last_name', last_name),
            position = coalesce(p_profile->>'position', position),
            country = coalesce(p_profile->>'country', country),
            gender = coalesce(p_profile->>'gender', gender),
            mobile = coalesce(p_profile->>'mobile', mobile),
            updated_at = now()
        where profiles.id = p_user_id;
    end if;

    return query
    select w.id, w.name, w.slug, w.logo_url
    from public.workspaces w
    where w.id = v_workspace_id;
end;
$$;

revoke all on function public.create_workspace_with_owner(text, text, uuid, jsonb) from public;
grant execute on function public.create_workspace_with_owner(text, text, uuid, jsonb) to authenticated;

-- >>> 20260529140000_workspace_join_codes_and_links.sql
-- Join codes on email invites, open workspace join links, and accept-by-code RPC.

-- ---------------------------------------------------------------------------
-- workspace_invites.join_code (column first; backfill after both tables exist)
-- ---------------------------------------------------------------------------
alter table public.workspace_invites
    add column if not exists join_code text;

-- ---------------------------------------------------------------------------
-- workspace_join_links (open invite) — must exist before generate_join_code()
-- ---------------------------------------------------------------------------
create table if not exists public.workspace_join_links (
    id uuid primary key default gen_random_uuid(),
    workspace_id uuid not null references public.workspaces (id) on delete cascade,
    role_id uuid not null references public.roles (id) on delete restrict,
    join_code text not null,
    created_by uuid not null references auth.users (id) on delete restrict,
    status text not null default 'active'::text,
    expires_at timestamptz not null,
    created_at timestamptz not null default now(),
    constraint workspace_join_links_join_code_key unique (join_code),
    constraint workspace_join_links_status_check
        check (status in ('active', 'revoked', 'expired'))
);

create index if not exists idx_workspace_join_links_workspace_id
    on public.workspace_join_links (workspace_id);

create index if not exists idx_workspace_join_links_join_code
    on public.workspace_join_links (join_code);

alter table public.workspace_join_links enable row level security;

drop policy if exists "workspace_join_links_select_member" on public.workspace_join_links;
create policy "workspace_join_links_select_member"
    on public.workspace_join_links for select
    using (
        public.is_workspace_member(workspace_id)
        or public.has_workspace_permission(workspace_id, 'members.invite')
    );

drop policy if exists "workspace_join_links_insert_perm" on public.workspace_join_links;
create policy "workspace_join_links_insert_perm"
    on public.workspace_join_links for insert
    with check (public.has_workspace_permission(workspace_id, 'members.invite'));

drop policy if exists "workspace_join_links_update_perm" on public.workspace_join_links;
create policy "workspace_join_links_update_perm"
    on public.workspace_join_links for update
    using (public.has_workspace_permission(workspace_id, 'members.invite'))
    with check (public.has_workspace_permission(workspace_id, 'members.invite'));

drop policy if exists "workspace_join_links_delete_perm" on public.workspace_join_links;
create policy "workspace_join_links_delete_perm"
    on public.workspace_join_links for delete
    using (public.has_workspace_permission(workspace_id, 'members.invite'));

-- ---------------------------------------------------------------------------
-- generate_join_code: 8 chars A-Z2-9 (no O/0/I/1)
-- ---------------------------------------------------------------------------
create or replace function public.generate_join_code()
returns text
language plpgsql
as $$
declare
    v_chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    v_code text := '';
    v_i int;
    v_exists boolean;
begin
    loop
        v_code := '';
        for v_i in 1..8 loop
            v_code := v_code || substr(v_chars, 1 + floor(random() * length(v_chars))::int, 1);
        end loop;

        select exists (
            select 1 from public.workspace_invites wi where wi.join_code = v_code
            union all
            select 1 from public.workspace_join_links wjl where wjl.join_code = v_code
        ) into v_exists;

        exit when not v_exists;
    end loop;

    return v_code;
end;
$$;

-- Backfill existing email invites (both tables must exist)
update public.workspace_invites
set join_code = public.generate_join_code()
where join_code is null;

alter table public.workspace_invites
    alter column join_code set not null;

alter table public.workspace_invites
    drop constraint if exists workspace_invites_join_code_key;

alter table public.workspace_invites
    add constraint workspace_invites_join_code_key unique (join_code);

create index if not exists idx_workspace_invites_join_code
    on public.workspace_invites (join_code);

create or replace function public.workspace_invites_set_join_code()
returns trigger
language plpgsql
as $$
begin
    if new.join_code is null or trim(new.join_code) = '' then
        new.join_code := public.generate_join_code();
    else
        new.join_code := upper(trim(new.join_code));
    end if;
    return new;
end;
$$;

drop trigger if exists trg_workspace_invites_set_join_code on public.workspace_invites;
create trigger trg_workspace_invites_set_join_code
    before insert on public.workspace_invites
    for each row
    execute function public.workspace_invites_set_join_code();

create or replace function public.workspace_join_links_set_join_code()
returns trigger
language plpgsql
as $$
begin
    if new.join_code is null or trim(new.join_code) = '' then
        new.join_code := public.generate_join_code();
    else
        new.join_code := upper(trim(new.join_code));
    end if;
    return new;
end;
$$;

drop trigger if exists trg_workspace_join_links_set_join_code on public.workspace_join_links;
create trigger trg_workspace_join_links_set_join_code
    before insert on public.workspace_join_links
    for each row
    execute function public.workspace_join_links_set_join_code();

-- ---------------------------------------------------------------------------
-- create_workspace_join_link
-- ---------------------------------------------------------------------------
create or replace function public.create_workspace_join_link(
    p_workspace_id uuid,
    p_role_id uuid,
    p_expires_at timestamptz
)
returns table (
    id uuid,
    join_code text,
    expires_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id uuid;
    v_link_id uuid;
    v_join_code text;
begin
    v_user_id := auth.uid();
    if v_user_id is null then
        raise exception 'unauthorized';
    end if;

    if not public.has_workspace_permission(p_workspace_id, 'members.invite') then
        raise exception 'forbidden';
    end if;

    if p_expires_at <= now() then
        raise exception 'expires_at_invalid';
    end if;

    if not exists (
        select 1
        from public.roles r
        where r.id = p_role_id
          and r.workspace_id = p_workspace_id
          and r.slug <> 'owner'
    ) then
        raise exception 'role_not_available';
    end if;

    v_join_code := public.generate_join_code();

    insert into public.workspace_join_links (
        workspace_id,
        role_id,
        join_code,
        created_by,
        expires_at,
        status
    )
    values (
        p_workspace_id,
        p_role_id,
        v_join_code,
        v_user_id,
        p_expires_at,
        'active'
    )
    returning workspace_join_links.id, workspace_join_links.join_code, workspace_join_links.expires_at
    into v_link_id, v_join_code, p_expires_at;

    return query
    select v_link_id, v_join_code, p_expires_at;
end;
$$;

grant execute on function public.create_workspace_join_link(uuid, uuid, timestamptz) to authenticated;

-- ---------------------------------------------------------------------------
-- accept_workspace_join_by_code
-- ---------------------------------------------------------------------------
create or replace function public.accept_workspace_join_by_code(p_join_code text)
returns table (
    workspace_id uuid,
    workspace_name text,
    workspace_slug text,
    source text
)
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id uuid;
    v_user_email text;
    v_code text;
    v_invite record;
    v_link record;
    v_accepter_name text;
    v_workspace_name text;
begin
    v_user_id := auth.uid();
    if v_user_id is null then
        raise exception 'unauthorized';
    end if;

    v_code := upper(trim(p_join_code));
    if v_code = '' or length(v_code) <> 8 then
        raise exception 'join_code_invalid';
    end if;

    select lower(u.email) into v_user_email
    from auth.users u
    where u.id = v_user_id;

    -- Try email invite first
    select
        wi.id,
        wi.workspace_id,
        wi.email,
        wi.role_id,
        wi.status,
        wi.expires_at,
        wi.invited_by
    into v_invite
    from public.workspace_invites wi
    where wi.join_code = v_code
    for update;

    if v_invite.id is not null then
        if v_invite.status <> 'pending' then
            raise exception 'invite_not_pending';
        end if;

        if v_invite.expires_at <= now() then
            update public.workspace_invites set status = 'expired' where id = v_invite.id;
            raise exception 'invite_expired';
        end if;

        if lower(v_invite.email) <> lower(v_user_email) then
            raise exception 'invite_email_mismatch';
        end if;

        if exists (
            select 1
            from public.workspace_members wm
            where wm.workspace_id = v_invite.workspace_id
              and wm.user_id = v_user_id
              and wm.status = 'active'
        ) then
            raise exception 'already_member';
        end if;

        insert into public.workspace_members (workspace_id, user_id, role_id, status)
        values (v_invite.workspace_id, v_user_id, v_invite.role_id, 'active');

        update public.workspace_invites
        set status = 'accepted'
        where id = v_invite.id;

        delete from public.user_notifications
        where invite_id = v_invite.id
          and user_id = v_user_id
          and kind = 'workspace_invite';

        v_accepter_name := public.notification_invitee_name(v_invite.email);

        select w.name into v_workspace_name
        from public.workspaces w
        where w.id = v_invite.workspace_id;

        perform public.insert_user_notification(
            v_invite.invited_by,
            'system.invite_accepted',
            'Invitation accepted',
            v_accepter_name || ' accepted your invitation to join ' || coalesce(v_workspace_name, 'your workspace') || '.',
            v_invite.id
        );

        return query
        select w.id, w.name, w.slug, 'email_invite'::text
        from public.workspaces w
        where w.id = v_invite.workspace_id;

        return;
    end if;

    -- Open join link
    select
        wjl.id,
        wjl.workspace_id,
        wjl.role_id,
        wjl.status,
        wjl.expires_at,
        wjl.created_by
    into v_link
    from public.workspace_join_links wjl
    where wjl.join_code = v_code
    for update;

    if v_link.id is null then
        raise exception 'join_code_not_found';
    end if;

    if v_link.status <> 'active' then
        raise exception 'join_link_not_active';
    end if;

    if v_link.expires_at <= now() then
        update public.workspace_join_links set status = 'expired' where id = v_link.id;
        raise exception 'join_link_expired';
    end if;

    if exists (
        select 1
        from public.workspace_members wm
        where wm.workspace_id = v_link.workspace_id
          and wm.user_id = v_user_id
          and wm.status = 'active'
    ) then
        raise exception 'already_member';
    end if;

    insert into public.workspace_members (workspace_id, user_id, role_id, status)
    values (v_link.workspace_id, v_user_id, v_link.role_id, 'active');

    v_accepter_name := public.notification_user_name(v_user_id);

    select w.name into v_workspace_name
    from public.workspaces w
    where w.id = v_link.workspace_id;

    perform public.insert_user_notification(
        v_link.created_by,
        'system.invite_accepted',
        'Member joined via link',
        v_accepter_name || ' joined ' || coalesce(v_workspace_name, 'your workspace') || ' using a join link.',
        null
    );

    return query
    select w.id, w.name, w.slug, 'join_link'::text
    from public.workspaces w
    where w.id = v_link.workspace_id;
end;
$$;

grant execute on function public.accept_workspace_join_by_code(text) to authenticated;

-- Sync notification on signup: backfill invite notification when user registers
create or replace function public.sync_pending_invite_notifications_for_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    v_invite record;
    v_workspace_name text;
    v_inviter_name text;
begin
    for v_invite in
        select wi.id, wi.workspace_id, wi.invited_by
        from public.workspace_invites wi
        where lower(wi.email) = lower(new.email)
          and wi.status = 'pending'
          and wi.expires_at > now()
    loop
        select w.name into v_workspace_name
        from public.workspaces w
        where w.id = v_invite.workspace_id;

        v_inviter_name := public.notification_user_name(v_invite.invited_by);

        insert into public.user_notifications (
            user_id,
            kind,
            title,
            body,
            invite_id
        )
        values (
            new.id,
            'workspace_invite',
            v_inviter_name || ' invited you',
            v_inviter_name || ' invited you to join ' || coalesce(v_workspace_name, 'a workspace') || '.',
            v_invite.id
        )
        on conflict (user_id, invite_id, kind)
        where invite_id is not null
        do nothing;
    end loop;

    return new;
end;
$$;

-- Note: auth.users trigger requires superuser on hosted Supabase; app backfill handles this.
-- Expose lookup by join_code for invite landing (anon can read workspace name via RPC)
create or replace function public.get_invite_landing_context(p_join_code text)
returns table (
    workspace_id uuid,
    workspace_name text,
    workspace_slug text,
    invite_kind text,
    expires_at timestamptz,
    is_valid boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
    v_code text;
begin
    v_code := upper(trim(p_join_code));

    return query
    select
        w.id,
        w.name,
        w.slug,
        'email_invite'::text,
        wi.expires_at,
        (wi.status = 'pending' and wi.expires_at > now())
    from public.workspace_invites wi
    join public.workspaces w on w.id = wi.workspace_id
    where wi.join_code = v_code
    limit 1;

    if found then
        return;
    end if;

    return query
    select
        w.id,
        w.name,
        w.slug,
        'join_link'::text,
        wjl.expires_at,
        (wjl.status = 'active' and wjl.expires_at > now())
    from public.workspace_join_links wjl
    join public.workspaces w on w.id = wjl.workspace_id
    where wjl.join_code = v_code
    limit 1;
end;
$$;

grant execute on function public.get_invite_landing_context(text) to anon, authenticated;

-- >>> 20260530120000_prepare_user_account_deletion.sql
-- Prepare user data before auth.users deletion (transfer ownership, clear RESTRICT FKs).

create or replace function public.prepare_user_account_deletion(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    v_workspace record;
    v_successor_user_id uuid;
    v_owner_role_id uuid;
begin
    if auth.uid() is not null and auth.uid() <> p_user_id then
        raise exception 'unauthorized';
    end if;

    for v_workspace in
        select w.id, w.name
        from public.workspaces w
        where w.owner_id = p_user_id
    loop
        select wm.user_id into v_successor_user_id
        from public.workspace_members wm
        join public.roles r on r.id = wm.role_id
        where wm.workspace_id = v_workspace.id
          and wm.status = 'active'
          and wm.user_id <> p_user_id
        order by (r.slug = 'admin') desc, wm.joined_at asc
        limit 1;

        if v_successor_user_id is null then
            raise exception 'cannot_delete_solo_workspace_owner'
                using detail = coalesce(v_workspace.name, v_workspace.id::text);
        end if;

        select id into v_owner_role_id
        from public.roles
        where workspace_id = v_workspace.id
          and slug = 'owner';

        update public.workspaces
        set
            owner_id = v_successor_user_id,
            created_by = v_successor_user_id,
            updated_at = now()
        where id = v_workspace.id;

        update public.workspace_members
        set role_id = v_owner_role_id
        where workspace_id = v_workspace.id
          and user_id = v_successor_user_id;
    end loop;

    update public.workspaces w
    set
        created_by = w.owner_id,
        updated_at = now()
    where w.created_by = p_user_id
      and w.owner_id <> p_user_id;

    update public.workspace_invites wi
    set invited_by = w.owner_id
    from public.workspaces w
    where wi.invited_by = p_user_id
      and wi.workspace_id = w.id;

    update public.workspace_join_links wjl
    set
        created_by = w.owner_id,
        status = case
            when wjl.status = 'active' then 'revoked'
            else wjl.status
        end
    from public.workspaces w
    where wjl.created_by = p_user_id
      and wjl.workspace_id = w.id;

    delete from public.workspace_transfers
    where from_user_id = p_user_id
       or to_user_id = p_user_id;
end;
$$;

revoke all on function public.prepare_user_account_deletion(uuid) from public;
grant execute on function public.prepare_user_account_deletion(uuid) to authenticated;
grant execute on function public.prepare_user_account_deletion(uuid) to service_role;

-- >>> 20260530130000_delete_solo_workspaces_on_account_deletion.sql
-- Allow deleting solo-owned workspaces when user confirms account deletion.

drop function if exists public.prepare_user_account_deletion(uuid);

create or replace function public.get_solo_owned_workspace_names(p_user_id uuid)
returns text[]
language sql
security definer
stable
set search_path = public
as $$
    select coalesce(array_agg(w.name order by w.name), '{}'::text[])
    from public.workspaces w
    where w.owner_id = p_user_id
      and not exists (
          select 1
          from public.workspace_members wm
          where wm.workspace_id = w.id
            and wm.status = 'active'
            and wm.user_id <> p_user_id
      );
$$;

revoke all on function public.get_solo_owned_workspace_names(uuid) from public;
grant execute on function public.get_solo_owned_workspace_names(uuid) to authenticated;
grant execute on function public.get_solo_owned_workspace_names(uuid) to service_role;

create or replace function public.prepare_user_account_deletion(
    p_user_id uuid,
    p_delete_solo_workspaces boolean default false
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    v_workspace record;
    v_successor_user_id uuid;
    v_owner_role_id uuid;
begin
    if auth.uid() is not null and auth.uid() <> p_user_id then
        raise exception 'unauthorized';
    end if;

    for v_workspace in
        select w.id, w.name
        from public.workspaces w
        where w.owner_id = p_user_id
    loop
        select wm.user_id into v_successor_user_id
        from public.workspace_members wm
        join public.roles r on r.id = wm.role_id
        where wm.workspace_id = v_workspace.id
          and wm.status = 'active'
          and wm.user_id <> p_user_id
        order by (r.slug = 'admin') desc, wm.joined_at asc
        limit 1;

        if v_successor_user_id is null then
            if p_delete_solo_workspaces then
                delete from public.workspaces
                where id = v_workspace.id;
            else
                raise exception 'cannot_delete_solo_workspace_owner'
                    using detail = coalesce(v_workspace.name, v_workspace.id::text);
            end if;
        else
            select id into v_owner_role_id
            from public.roles
            where workspace_id = v_workspace.id
              and slug = 'owner';

            update public.workspaces
            set
                owner_id = v_successor_user_id,
                created_by = v_successor_user_id,
                updated_at = now()
            where id = v_workspace.id;

            update public.workspace_members
            set role_id = v_owner_role_id
            where workspace_id = v_workspace.id
              and user_id = v_successor_user_id;
        end if;
    end loop;

    update public.workspaces w
    set
        created_by = w.owner_id,
        updated_at = now()
    where w.created_by = p_user_id
      and w.owner_id <> p_user_id;

    update public.workspace_invites wi
    set invited_by = w.owner_id
    from public.workspaces w
    where wi.invited_by = p_user_id
      and wi.workspace_id = w.id;

    update public.workspace_join_links wjl
    set
        created_by = w.owner_id,
        status = case
            when wjl.status = 'active' then 'revoked'
            else wjl.status
        end
    from public.workspaces w
    where wjl.created_by = p_user_id
      and wjl.workspace_id = w.id;

    delete from public.workspace_transfers
    where from_user_id = p_user_id
       or to_user_id = p_user_id;
end;
$$;

revoke all on function public.prepare_user_account_deletion(uuid, boolean) from public;
grant execute on function public.prepare_user_account_deletion(uuid, boolean) to authenticated;
grant execute on function public.prepare_user_account_deletion(uuid, boolean) to service_role;

-- >>> 20260530140000_rls_perf_initplan_and_consolidate.sql
-- RLS performance: auth initplan (select auth.*()) and consolidate duplicate permissive policies.
-- Resolves Supabase linter 0003 (auth_rls_initplan) and 0006 (multiple_permissive_policies).

-- ---------------------------------------------------------------------------
-- 1. Helper functions: evaluate auth.uid() once per statement
-- ---------------------------------------------------------------------------
create or replace function public.is_workspace_member(ws_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.workspace_members wm
        where wm.workspace_id = ws_id
          and wm.user_id = (select auth.uid())
          and wm.status = 'active'
    );
$$;

create or replace function public.is_workspace_owner(ws_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.workspaces w
        where w.id = ws_id
          and w.owner_id = (select auth.uid())
    );
$$;

create or replace function public.has_workspace_permission(ws_id uuid, perm_key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.workspace_members wm
        join public.roles r on r.id = wm.role_id
        join public.role_permissions rp on rp.role_id = r.id
        join public.permissions p on p.id = rp.permission_id
        where wm.workspace_id = ws_id
          and wm.user_id = (select auth.uid())
          and wm.status = 'active'
          and p.key = perm_key
    );
$$;

-- ---------------------------------------------------------------------------
-- 2. profiles: drop legacy + split policies; one policy per command
-- ---------------------------------------------------------------------------
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Trigger can insert profile on signup" on public.profiles;
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_select_workspace_peer" on public.profiles;
drop policy if exists "profiles_select_pending_inviter" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select"
    on public.profiles for select
    using (
        (select auth.uid()) = id
        or exists (
            select 1
            from public.workspace_members wm_self
            join public.workspace_members wm_peer
                on wm_peer.workspace_id = wm_self.workspace_id
            where wm_self.user_id = (select auth.uid())
              and wm_peer.user_id = profiles.id
              and wm_self.status = 'active'
              and wm_peer.status = 'active'
        )
        or exists (
            select 1
            from public.workspace_invites wi
            where wi.invited_by = profiles.id
              and lower(wi.email) = lower(coalesce((select auth.jwt()) ->> 'email', ''))
        )
    );

create policy "profiles_insert"
    on public.profiles for insert
    with check ((select auth.uid()) = id);

create policy "profiles_update"
    on public.profiles for update
    using ((select auth.uid()) = id)
    with check ((select auth.uid()) = id);

-- ---------------------------------------------------------------------------
-- 3. workspaces
-- ---------------------------------------------------------------------------
drop policy if exists "workspace read by members" on public.workspaces;
drop policy if exists "workspace update by owner" on public.workspaces;
drop policy if exists "workspaces_select_member" on public.workspaces;
drop policy if exists "workspaces_update_owner_or_perm" on public.workspaces;
drop policy if exists "workspaces_insert_creator" on public.workspaces;

create policy "workspaces_select_member"
    on public.workspaces for select
    using (
        public.is_workspace_member(id)
        or exists (
            select 1
            from public.workspace_invites wi
            where wi.workspace_id = workspaces.id
              and lower(wi.email) = lower(coalesce((select auth.jwt()) ->> 'email', ''))
        )
    );

create policy "workspaces_update_owner_or_perm"
    on public.workspaces for update
    using (
        public.is_workspace_owner(id)
        or public.has_workspace_permission(id, 'workspace.update')
    )
    with check (
        public.is_workspace_owner(id)
        or public.has_workspace_permission(id, 'workspace.update')
    );

create policy "workspaces_insert_creator"
    on public.workspaces for insert
    with check (
        (select auth.uid()) = created_by
        and (select auth.uid()) = owner_id
    );

-- ---------------------------------------------------------------------------
-- 4. workspace_members
-- ---------------------------------------------------------------------------
drop policy if exists "owner can manage members" on public.workspace_members;
drop policy if exists "members can read own workspace membership" on public.workspace_members;
drop policy if exists "workspace_members_select_member" on public.workspace_members;
drop policy if exists "workspace_members_insert_invite_perm" on public.workspace_members;
drop policy if exists "workspace_members_update_owner_or_perm" on public.workspace_members;
drop policy if exists "workspace_members_delete_owner_or_perm" on public.workspace_members;

create policy "workspace_members_select_member"
    on public.workspace_members for select
    using (public.is_workspace_member(workspace_id));

create policy "workspace_members_insert_invite_perm"
    on public.workspace_members for insert
    with check (
        public.has_workspace_permission(workspace_id, 'members.invite')
        or public.is_workspace_owner(workspace_id)
    );

create policy "workspace_members_update_owner_or_perm"
    on public.workspace_members for update
    using (
        public.is_workspace_owner(workspace_id)
        or public.has_workspace_permission(workspace_id, 'members.remove')
    )
    with check (
        public.is_workspace_owner(workspace_id)
        or public.has_workspace_permission(workspace_id, 'members.remove')
    );

create policy "workspace_members_delete_owner_or_perm"
    on public.workspace_members for delete
    using (
        public.is_workspace_owner(workspace_id)
        or public.has_workspace_permission(workspace_id, 'members.remove')
        or (select auth.uid()) = user_id
    );

-- ---------------------------------------------------------------------------
-- 5. role_permissions: single SELECT; writes without overlapping SELECT
-- ---------------------------------------------------------------------------
drop policy if exists "role_permissions_select_member" on public.role_permissions;
drop policy if exists "role_permissions_modify_perm" on public.role_permissions;

create policy "role_permissions_select"
    on public.role_permissions for select
    using (
        exists (
            select 1
            from public.roles r
            where r.id = role_permissions.role_id
              and public.is_workspace_member(r.workspace_id)
        )
        or exists (
            select 1
            from public.roles r
            where r.id = role_permissions.role_id
              and public.has_workspace_permission(r.workspace_id, 'roles.update')
        )
    );

create policy "role_permissions_insert"
    on public.role_permissions for insert
    with check (
        exists (
            select 1
            from public.roles r
            where r.id = role_permissions.role_id
              and public.has_workspace_permission(r.workspace_id, 'roles.update')
        )
    );

create policy "role_permissions_update"
    on public.role_permissions for update
    using (
        exists (
            select 1
            from public.roles r
            where r.id = role_permissions.role_id
              and public.has_workspace_permission(r.workspace_id, 'roles.update')
        )
    )
    with check (
        exists (
            select 1
            from public.roles r
            where r.id = role_permissions.role_id
              and public.has_workspace_permission(r.workspace_id, 'roles.update')
        )
    );

create policy "role_permissions_delete"
    on public.role_permissions for delete
    using (
        exists (
            select 1
            from public.roles r
            where r.id = role_permissions.role_id
              and public.has_workspace_permission(r.workspace_id, 'roles.update')
        )
    );

-- ---------------------------------------------------------------------------
-- 6. workspace_invites
-- ---------------------------------------------------------------------------
drop policy if exists "invite manage" on public.workspace_invites;
drop policy if exists "workspace_invites_select_member" on public.workspace_invites;
drop policy if exists "workspace_invites_insert_perm" on public.workspace_invites;
drop policy if exists "workspace_invites_update_perm" on public.workspace_invites;
drop policy if exists "workspace_invites_delete_perm" on public.workspace_invites;

create policy "workspace_invites_select_member"
    on public.workspace_invites for select
    using (
        public.is_workspace_member(workspace_id)
        or lower(email) = lower(coalesce((select auth.jwt()) ->> 'email', ''))
    );

create policy "workspace_invites_insert_perm"
    on public.workspace_invites for insert
    with check (public.has_workspace_permission(workspace_id, 'members.invite'));

create policy "workspace_invites_update_perm"
    on public.workspace_invites for update
    using (
        public.has_workspace_permission(workspace_id, 'members.invite')
        or lower(email) = lower(coalesce((select auth.jwt()) ->> 'email', ''))
    )
    with check (
        public.has_workspace_permission(workspace_id, 'members.invite')
        or lower(email) = lower(coalesce((select auth.jwt()) ->> 'email', ''))
    );

create policy "workspace_invites_delete_perm"
    on public.workspace_invites for delete
    using (public.has_workspace_permission(workspace_id, 'members.invite'));

-- ---------------------------------------------------------------------------
-- 7. workspace_transfers
-- ---------------------------------------------------------------------------
drop policy if exists "workspace_transfers_select_parties" on public.workspace_transfers;
drop policy if exists "workspace_transfers_update_parties" on public.workspace_transfers;

create policy "workspace_transfers_select_parties"
    on public.workspace_transfers for select
    using (
        public.is_workspace_owner(workspace_id)
        or (select auth.uid()) in (from_user_id, to_user_id)
    );

create policy "workspace_transfers_update_parties"
    on public.workspace_transfers for update
    using (
        public.is_workspace_owner(workspace_id)
        or (select auth.uid()) in (from_user_id, to_user_id)
    )
    with check (
        public.is_workspace_owner(workspace_id)
        or (select auth.uid()) in (from_user_id, to_user_id)
    );

-- ---------------------------------------------------------------------------
-- 8. subscriptions
-- ---------------------------------------------------------------------------
drop policy if exists "Users can view own subscriptions" on public.subscriptions;
drop policy if exists "subscriptions_select_own" on public.subscriptions;

create policy "subscriptions_select_own"
    on public.subscriptions for select
    using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- 9. user_notifications
-- ---------------------------------------------------------------------------
drop policy if exists "user_notifications_select_own" on public.user_notifications;
drop policy if exists "user_notifications_insert_own" on public.user_notifications;
drop policy if exists "user_notifications_update_own" on public.user_notifications;
drop policy if exists "user_notifications_delete_own" on public.user_notifications;

create policy "user_notifications_select_own"
    on public.user_notifications for select
    using ((select auth.uid()) = user_id);

create policy "user_notifications_insert_own"
    on public.user_notifications for insert
    with check ((select auth.uid()) = user_id);

create policy "user_notifications_update_own"
    on public.user_notifications for update
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

create policy "user_notifications_delete_own"
    on public.user_notifications for delete
    using ((select auth.uid()) = user_id);

-- >>> 20260530150000_security_linter_fixes.sql
-- ---------------------------------------------------------------------------
-- 2. Function search_path (lint 0011)
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create or replace function public.generate_join_code()
returns text
language plpgsql
set search_path = public
as $$
declare
    v_chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    v_code text := '';
    v_i int;
    v_exists boolean;
begin
    loop
        v_code := '';
        for v_i in 1..8 loop
            v_code := v_code || substr(v_chars, 1 + floor(random() * length(v_chars))::int, 1);
        end loop;

        select exists (
            select 1 from public.workspace_invites wi where wi.join_code = v_code
            union all
            select 1 from public.workspace_join_links wjl where wjl.join_code = v_code
        ) into v_exists;

        exit when not v_exists;
    end loop;

    return v_code;
end;
$$;

create or replace function public.workspace_invites_set_join_code()
returns trigger
language plpgsql
set search_path = public
as $$
begin
    if new.join_code is null or trim(new.join_code) = '' then
        new.join_code := public.generate_join_code();
    else
        new.join_code := upper(trim(new.join_code));
    end if;
    return new;
end;
$$;

create or replace function public.workspace_join_links_set_join_code()
returns trigger
language plpgsql
set search_path = public
as $$
begin
    if new.join_code is null or trim(new.join_code) = '' then
        new.join_code := public.generate_join_code();
    else
        new.join_code := upper(trim(new.join_code));
    end if;
    return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. monitoring_events: explicit no PostgREST access (lint 0008 INFO)
-- ---------------------------------------------------------------------------
do $$
begin
    if exists (
        select 1
        from pg_tables
        where schemaname = 'public'
          and tablename = 'monitoring_events'
    ) then
        execute $policy$
            drop policy if exists "monitoring_events_no_api_access" on public.monitoring_events
        $policy$;

        execute $policy$
            create policy "monitoring_events_no_api_access"
                on public.monitoring_events
                for all
                to authenticated, anon
                using (false)
                with check (false)
        $policy$;
    end if;
end $$;

-- >>> 20260611120000_onboarding_completed_at.sql
-- Track when a user finished the blocking onboarding flow.
alter table public.profiles
    add column if not exists onboarding_completed_at timestamptz null;

comment on column public.profiles.onboarding_completed_at is
    'Set when the user completes the blocking onboarding dialog (profile + workspace configure or invite join).';

-- >>> 20260612120000_workspace_logos_storage.sql
-- Public bucket for workspace logos (Account Settings 03 branding section).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'workspace-logos',
    'workspace-logos',
    true,
    2097152,
    array['image/png', 'image/jpeg', 'image/webp']::text[]
)
on conflict (id) do update
set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "workspace_logos_public_read" on storage.objects;
create policy "workspace_logos_public_read"
    on storage.objects for select
    to public
    using (bucket_id = 'workspace-logos');

drop policy if exists "workspace_logos_owner_insert" on storage.objects;
create policy "workspace_logos_owner_insert"
    on storage.objects for insert
    to authenticated
    with check (
        bucket_id = 'workspace-logos'
        and auth.uid() is not null
        and exists (
            select 1
            from public.workspaces w
            join public.workspace_members wm
                on wm.workspace_id = w.id
                and wm.user_id = auth.uid()
                and wm.status = 'active'
            join public.roles r
                on r.id = wm.role_id
                and r.slug = 'owner'
            where w.id::text = (storage.foldername(objects.name))[1]
        )
    );

drop policy if exists "workspace_logos_owner_update" on storage.objects;
create policy "workspace_logos_owner_update"
    on storage.objects for update
    to authenticated
    using (
        bucket_id = 'workspace-logos'
        and auth.uid() is not null
        and exists (
            select 1
            from public.workspaces w
            join public.workspace_members wm
                on wm.workspace_id = w.id
                and wm.user_id = auth.uid()
                and wm.status = 'active'
            join public.roles r
                on r.id = wm.role_id
                and r.slug = 'owner'
            where w.id::text = (storage.foldername(objects.name))[1]
        )
    );

drop policy if exists "workspace_logos_owner_delete" on storage.objects;
create policy "workspace_logos_owner_delete"
    on storage.objects for delete
    to authenticated
    using (
        bucket_id = 'workspace-logos'
        and auth.uid() is not null
        and exists (
            select 1
            from public.workspaces w
            join public.workspace_members wm
                on wm.workspace_id = w.id
                and wm.user_id = auth.uid()
                and wm.status = 'active'
            join public.roles r
                on r.id = wm.role_id
                and r.slug = 'owner'
            where w.id::text = (storage.foldername(objects.name))[1]
        )
    );

-- >>> 20260612120000_workspace_onboarding_goals.sql
-- Goal slugs selected during owner onboarding (see lib/onboarding/goals.ts).
alter table public.workspaces
    add column if not exists onboarding_goals text[] not null default '{}';

comment on column public.workspaces.onboarding_goals is
    'Goal slugs selected during owner onboarding (see lib/ui/onboarding-feed-data goalOptions).';

alter table public.workspaces
    drop constraint if exists workspaces_onboarding_goals_valid;

alter table public.workspaces
    add constraint workspaces_onboarding_goals_valid
    check (
        onboarding_goals <@ array[
            'manage-projects',
            'team-collaboration',
            'track-performance',
            'automate-workflows'
        ]::text[]
    );

-- >>> 20260612130000_workspace_logos_pbac.sql
-- Align workspace logo storage policies with workspace.update PBAC (not owner role only).

drop policy if exists "workspace_logos_owner_insert" on storage.objects;
drop policy if exists "workspace_logos_owner_update" on storage.objects;
drop policy if exists "workspace_logos_owner_delete" on storage.objects;

create policy "workspace_logos_update_insert"
    on storage.objects for insert
    to authenticated
    with check (
        bucket_id = 'workspace-logos'
        and auth.uid() is not null
        and public.has_workspace_permission(
            ((storage.foldername(objects.name))[1])::uuid,
            'workspace.update'
        )
    );

create policy "workspace_logos_update_update"
    on storage.objects for update
    to authenticated
    using (
        bucket_id = 'workspace-logos'
        and auth.uid() is not null
        and public.has_workspace_permission(
            ((storage.foldername(objects.name))[1])::uuid,
            'workspace.update'
        )
    );

create policy "workspace_logos_update_delete"
    on storage.objects for delete
    to authenticated
    using (
        bucket_id = 'workspace-logos'
        and auth.uid() is not null
        and public.has_workspace_permission(
            ((storage.foldername(objects.name))[1])::uuid,
            'workspace.update'
        )
    );

-- >>> 20260613120000_member_custom_permissions.sql
-- Per-member custom permission overrides (preset roles remain in role_permissions).

alter table public.workspace_members
    add column if not exists uses_custom_permissions boolean not null default false;

create table if not exists public.workspace_member_permissions (
    membership_id uuid not null references public.workspace_members (id) on delete cascade,
    permission_id uuid not null references public.permissions (id) on delete cascade,
    primary key (membership_id, permission_id)
);

create index if not exists idx_workspace_member_permissions_membership_id
    on public.workspace_member_permissions (membership_id);

alter table public.workspace_member_permissions enable row level security;

drop policy if exists "workspace_member_permissions_select_member" on public.workspace_member_permissions;
create policy "workspace_member_permissions_select_member"
    on public.workspace_member_permissions for select
    using (
        exists (
            select 1
            from public.workspace_members wm
            where wm.id = workspace_member_permissions.membership_id
              and public.is_workspace_member(wm.workspace_id)
        )
    );

drop policy if exists "workspace_member_permissions_insert_perm" on public.workspace_member_permissions;
create policy "workspace_member_permissions_insert_perm"
    on public.workspace_member_permissions for insert
    with check (
        exists (
            select 1
            from public.workspace_members wm
            where wm.id = workspace_member_permissions.membership_id
              and public.has_workspace_permission(wm.workspace_id, 'members.remove')
        )
    );

drop policy if exists "workspace_member_permissions_delete_perm" on public.workspace_member_permissions;
create policy "workspace_member_permissions_delete_perm"
    on public.workspace_member_permissions for delete
    using (
        exists (
            select 1
            from public.workspace_members wm
            where wm.id = workspace_member_permissions.membership_id
              and public.has_workspace_permission(wm.workspace_id, 'members.remove')
        )
    );

-- Effective permissions: owner → all; custom → member_permissions; else → role_permissions.
create or replace function public.has_workspace_permission(ws_id uuid, perm_key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.workspace_members wm
        where wm.workspace_id = ws_id
          and wm.user_id = (select auth.uid())
          and wm.status = 'active'
          and (
            public.is_workspace_owner(ws_id)
            or (
                wm.uses_custom_permissions = true
                and exists (
                    select 1
                    from public.workspace_member_permissions wmp
                    join public.permissions p on p.id = wmp.permission_id
                    where wmp.membership_id = wm.id
                      and p.key = perm_key
                )
            )
            or (
                wm.uses_custom_permissions = false
                and exists (
                    select 1
                    from public.role_permissions rp
                    join public.permissions p on p.id = rp.permission_id
                    where rp.role_id = wm.role_id
                      and p.key = perm_key
                )
            )
          )
    );
$$;

revoke all on function public.has_workspace_permission(uuid, text) from public;
grant execute on function public.has_workspace_permission(uuid, text) to authenticated;

create or replace function public.get_member_access_context(p_membership_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    v_workspace_id uuid;
    v_member jsonb;
    v_roles jsonb;
    v_permissions jsonb;
    v_role_permission_keys jsonb;
    v_effective_keys jsonb;
begin
    select wm.workspace_id
    into v_workspace_id
    from public.workspace_members wm
    where wm.id = p_membership_id
      and wm.status = 'active';

    if v_workspace_id is null then
        raise exception 'member_not_found';
    end if;

    if not public.is_workspace_member(v_workspace_id) then
        raise exception 'forbidden';
    end if;

    if not public.has_workspace_permission(v_workspace_id, 'members.remove') then
        raise exception 'forbidden';
    end if;

    perform public.ensure_workspace_system_roles(v_workspace_id);

    select jsonb_build_object(
        'membershipId', wm.id,
        'userId', wm.user_id,
        'email', u.email,
        'firstName', p.first_name,
        'lastName', p.last_name,
        'avatarUrl', p.avatar_url,
        'roleId', r.id,
        'roleSlug', r.slug,
        'roleName', r.name,
        'isOwner', (w.owner_id = wm.user_id),
        'usesCustomPermissions', wm.uses_custom_permissions
    )
    into v_member
    from public.workspace_members wm
    join auth.users u on u.id = wm.user_id
    left join public.profiles p on p.id = wm.user_id
    join public.roles r on r.id = wm.role_id
    join public.workspaces w on w.id = wm.workspace_id
    where wm.id = p_membership_id;

    select coalesce(
        jsonb_agg(
            jsonb_build_object(
                'id', r.id,
                'slug', r.slug,
                'name', r.name
            )
            order by r.name
        ),
        '[]'::jsonb
    )
    into v_roles
    from public.roles r
    where r.workspace_id = v_workspace_id
      and r.slug <> 'owner';

    select coalesce(
        jsonb_agg(
            jsonb_build_object(
                'key', p.key,
                'description', p.description
            )
            order by p.key
        ),
        '[]'::jsonb
    )
    into v_permissions
    from public.permissions p;

    select coalesce(
        jsonb_object_agg(
            role_perms.role_id::text,
            role_perms.keys
        ),
        '{}'::jsonb
    )
    into v_role_permission_keys
    from (
        select
            r.id as role_id,
            coalesce(
                jsonb_agg(p.key order by p.key) filter (where p.key is not null),
                '[]'::jsonb
            ) as keys
        from public.roles r
        left join public.role_permissions rp on rp.role_id = r.id
        left join public.permissions p on p.id = rp.permission_id
        where r.workspace_id = v_workspace_id
          and r.slug <> 'owner'
        group by r.id
    ) role_perms;

    select coalesce(
        jsonb_agg(p.key order by p.key),
        '[]'::jsonb
    )
    into v_effective_keys
    from public.workspace_members wm
    join public.workspaces w on w.id = wm.workspace_id
    left join public.workspace_member_permissions wmp
        on wmp.membership_id = wm.id and wm.uses_custom_permissions = true
    left join public.role_permissions rp
        on rp.role_id = wm.role_id and wm.uses_custom_permissions = false
    join public.permissions p
        on p.id = coalesce(
            case when wm.uses_custom_permissions then wmp.permission_id end,
            case when not wm.uses_custom_permissions then rp.permission_id end
        )
    where wm.id = p_membership_id
      and w.owner_id <> wm.user_id;

    -- Workspace owner: all catalog permissions are effective.
    if (v_member ->> 'isOwner')::boolean then
        v_effective_keys := (
            select coalesce(jsonb_agg(p.key order by p.key), '[]'::jsonb)
            from public.permissions p
        );
    end if;

    return jsonb_build_object(
        'member', v_member,
        'assignableRoles', v_roles,
        'permissions', v_permissions,
        'rolePermissionKeys', v_role_permission_keys,
        'effectivePermissionKeys', v_effective_keys
    );
end;
$$;

revoke all on function public.get_member_access_context(uuid) from public;
grant execute on function public.get_member_access_context(uuid) to authenticated;

-- Extend team members RPC with custom-permission flag for list UI.
drop function if exists public.get_workspace_team_members(uuid);

create or replace function public.get_workspace_team_members(p_workspace_id uuid)
returns table (
    membership_id uuid,
    user_id uuid,
    email text,
    first_name text,
    last_name text,
    avatar_url text,
    role_id uuid,
    role_slug text,
    role_name text,
    is_workspace_owner boolean,
    uses_custom_permissions boolean
)
language plpgsql
security definer
set search_path = public
as $$
begin
    if not public.is_workspace_member(p_workspace_id) then
        raise exception 'forbidden';
    end if;

    perform public.ensure_workspace_system_roles(p_workspace_id);

    return query
    select
        wm.id,
        wm.user_id,
        u.email::text,
        p.first_name,
        p.last_name,
        p.avatar_url,
        r.id,
        r.slug,
        r.name,
        (w.owner_id = wm.user_id),
        wm.uses_custom_permissions
    from public.workspace_members wm
    join auth.users u on u.id = wm.user_id
    left join public.profiles p on p.id = wm.user_id
    join public.roles r on r.id = wm.role_id
    join public.workspaces w on w.id = wm.workspace_id
    where wm.workspace_id = p_workspace_id
      and wm.status = 'active'
    order by (w.owner_id = wm.user_id) desc, wm.joined_at asc;
end;
$$;

revoke all on function public.get_workspace_team_members(uuid) from public;
grant execute on function public.get_workspace_team_members(uuid) to authenticated;

-- >>> 20260613130000_fix_team_members_order.sql
-- Fix get_workspace_team_members: workspace_members has joined_at, not created_at.

create or replace function public.get_workspace_team_members(p_workspace_id uuid)
returns table (
    membership_id uuid,
    user_id uuid,
    email text,
    first_name text,
    last_name text,
    avatar_url text,
    role_id uuid,
    role_slug text,
    role_name text,
    is_workspace_owner boolean,
    uses_custom_permissions boolean
)
language plpgsql
security definer
set search_path = public
as $$
begin
    if not public.is_workspace_member(p_workspace_id) then
        raise exception 'forbidden';
    end if;

    perform public.ensure_workspace_system_roles(p_workspace_id);

    return query
    select
        wm.id,
        wm.user_id,
        u.email::text,
        p.first_name,
        p.last_name,
        p.avatar_url,
        r.id,
        r.slug,
        r.name,
        (w.owner_id = wm.user_id),
        wm.uses_custom_permissions
    from public.workspace_members wm
    join auth.users u on u.id = wm.user_id
    left join public.profiles p on p.id = wm.user_id
    join public.roles r on r.id = wm.role_id
    join public.workspaces w on w.id = wm.workspace_id
    where wm.workspace_id = p_workspace_id
      and wm.status = 'active'
    order by (w.owner_id = wm.user_id) desc, wm.joined_at asc;
end;
$$;

revoke all on function public.get_workspace_team_members(uuid) from public;
grant execute on function public.get_workspace_team_members(uuid) to authenticated;

-- >>> 20260614120000_fix_handle_new_user_trigger.sql
-- Signup fails with "Database error saving new user" when auth.users INSERT fires a
-- profile bootstrap trigger that runs as supabase_auth_admin (security invoker) under RLS.
-- SECURITY DEFINER lets the function insert as the owner and bypass RLS safely.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (id, first_name, last_name)
    values (
        new.id,
        nullif(trim(new.raw_user_meta_data ->> 'first_name'), ''),
        nullif(trim(new.raw_user_meta_data ->> 'last_name'), '')
    )
    on conflict (id) do nothing;

    return new;
end;
$$;

revoke all on function public.handle_new_user() from public;
grant execute on function public.handle_new_user() to supabase_auth_admin;
grant execute on function public.handle_new_user() to service_role;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row
    execute function public.handle_new_user();

-- >>> 20260615120000_workspace_transfer_flow.sql
-- Workspace ownership transfer: dual confirmation + notifications.

alter table public.workspace_transfers
    add column if not exists recipient_confirmed_at timestamptz null;

alter table public.user_notifications
    add column if not exists transfer_id uuid null references public.workspace_transfers (id) on delete cascade;

create unique index if not exists idx_user_notifications_transfer_unique
    on public.user_notifications (transfer_id)
    where transfer_id is not null;

create unique index if not exists idx_workspace_transfers_one_pending
    on public.workspace_transfers (workspace_id)
    where status = 'pending';

alter table public.user_notifications
    drop constraint if exists user_notifications_kind_check;

alter table public.user_notifications
    add constraint user_notifications_kind_check
    check (kind in (
        'workspace_invite',
        'workspace_transfer',
        'system.invite_sent',
        'system.invite_revoked',
        'system.invite_revoked_invitee',
        'system.invite_accepted',
        'system.invite_declined'
    ));

create or replace function public.insert_user_notification(
    p_user_id uuid,
    p_kind text,
    p_title text,
    p_body text,
    p_invite_id uuid default null,
    p_transfer_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    if p_user_id is null then
        return;
    end if;

    insert into public.user_notifications (user_id, kind, title, body, invite_id, transfer_id)
    values (p_user_id, p_kind, p_title, p_body, p_invite_id, p_transfer_id);
end;
$$;

revoke all on function public.insert_user_notification(uuid, text, text, text, uuid, uuid) from public;
grant execute on function public.insert_user_notification(uuid, text, text, text, uuid, uuid) to authenticated;

create or replace function public.initiate_workspace_transfer(
    p_workspace_id uuid,
    p_to_user_id uuid
)
returns table (
    transfer_id uuid,
    token text
)
language plpgsql
security definer
set search_path = public
as $$
declare
    v_from_user_id uuid := auth.uid();
    v_owner_id uuid;
    v_workspace_name text;
    v_admin_role_id uuid;
    v_transfer_id uuid;
    v_token text;
    v_from_name text;
begin
    if v_from_user_id is null then
        raise exception 'unauthorized';
    end if;

    select w.owner_id, w.name
    into v_owner_id, v_workspace_name
    from public.workspaces w
    where w.id = p_workspace_id;

    if v_owner_id is null then
        raise exception 'workspace_not_found';
    end if;

    if v_owner_id <> v_from_user_id then
        raise exception 'forbidden';
    end if;

    if p_to_user_id = v_from_user_id then
        raise exception 'cannot_transfer_to_self';
    end if;

    if not exists (
        select 1
        from public.workspace_members wm
        join public.roles r on r.id = wm.role_id
        where wm.workspace_id = p_workspace_id
          and wm.user_id = p_to_user_id
          and wm.status = 'active'
          and r.slug = 'admin'
    ) then
        raise exception 'recipient_must_be_admin';
    end if;

    if exists (
        select 1
        from public.workspace_transfers wt
        where wt.workspace_id = p_workspace_id
          and wt.status = 'pending'
    ) then
        raise exception 'transfer_already_pending';
    end if;

    v_token := encode(gen_random_bytes(24), 'hex');

    insert into public.workspace_transfers (
        workspace_id,
        from_user_id,
        to_user_id,
        status,
        token
    )
    values (
        p_workspace_id,
        v_from_user_id,
        p_to_user_id,
        'pending',
        v_token
    )
    returning id into v_transfer_id;

    select coalesce(nullif(trim(concat_ws(' ', p.first_name, p.last_name)), ''), u.email)
    into v_from_name
    from auth.users u
    left join public.profiles p on p.id = u.id
    where u.id = v_from_user_id;

    perform public.insert_user_notification(
        p_to_user_id,
        'workspace_transfer',
        'Workspace ownership transfer',
        coalesce(v_from_name, 'The workspace owner') || ' wants to transfer ownership of '
            || coalesce(v_workspace_name, 'this workspace') || ' to you. Review and accept the transfer.',
        null,
        v_transfer_id
    );

    return query select v_transfer_id, v_token;
end;
$$;

revoke all on function public.initiate_workspace_transfer(uuid, uuid) from public;
grant execute on function public.initiate_workspace_transfer(uuid, uuid) to authenticated;

create or replace function public.confirm_workspace_transfer_recipient(
    p_transfer_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id uuid := auth.uid();
    v_transfer public.workspace_transfers%rowtype;
    v_workspace_name text;
    v_recipient_name text;
begin
    if v_user_id is null then
        raise exception 'unauthorized';
    end if;

    select *
    into v_transfer
    from public.workspace_transfers wt
    where wt.id = p_transfer_id;

    if v_transfer.id is null then
        raise exception 'transfer_not_found';
    end if;

    if v_transfer.status <> 'pending' then
        raise exception 'transfer_not_pending';
    end if;

    if v_transfer.to_user_id <> v_user_id then
        raise exception 'forbidden';
    end if;

    update public.workspace_transfers
    set recipient_confirmed_at = now()
    where id = p_transfer_id;

    select w.name into v_workspace_name
    from public.workspaces w
    where w.id = v_transfer.workspace_id;

    select coalesce(nullif(trim(concat_ws(' ', p.first_name, p.last_name)), ''), u.email)
    into v_recipient_name
    from auth.users u
    left join public.profiles p on p.id = u.id
    where u.id = v_user_id;

    perform public.insert_user_notification(
        v_transfer.from_user_id,
        'workspace_transfer',
        'Transfer ready to finalize',
        coalesce(v_recipient_name, 'The selected admin')
            || ' accepted the ownership transfer for '
            || coalesce(v_workspace_name, 'your workspace')
            || '. Confirm the transfer to complete it.',
        null,
        p_transfer_id
    );
end;
$$;

revoke all on function public.confirm_workspace_transfer_recipient(uuid) from public;
grant execute on function public.confirm_workspace_transfer_recipient(uuid) to authenticated;

create or replace function public.finalize_workspace_transfer(
    p_transfer_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id uuid := auth.uid();
    v_transfer public.workspace_transfers%rowtype;
    v_owner_role_id uuid;
    v_admin_role_id uuid;
begin
    if v_user_id is null then
        raise exception 'unauthorized';
    end if;

    select *
    into v_transfer
    from public.workspace_transfers wt
    where wt.id = p_transfer_id;

    if v_transfer.id is null then
        raise exception 'transfer_not_found';
    end if;

    if v_transfer.status <> 'pending' then
        raise exception 'transfer_not_pending';
    end if;

    if v_transfer.from_user_id <> v_user_id then
        raise exception 'forbidden';
    end if;

    if v_transfer.recipient_confirmed_at is null then
        raise exception 'recipient_not_confirmed';
    end if;

    select r.id into v_owner_role_id
    from public.roles r
    where r.workspace_id = v_transfer.workspace_id
      and r.slug = 'owner'
    limit 1;

    select r.id into v_admin_role_id
    from public.roles r
    where r.workspace_id = v_transfer.workspace_id
      and r.slug = 'admin'
    limit 1;

    if v_owner_role_id is null or v_admin_role_id is null then
        raise exception 'roles_not_found';
    end if;

    update public.workspaces
    set owner_id = v_transfer.to_user_id
    where id = v_transfer.workspace_id;

    update public.workspace_members
    set role_id = v_admin_role_id
    where workspace_id = v_transfer.workspace_id
      and user_id = v_transfer.from_user_id
      and status = 'active';

    update public.workspace_members
    set role_id = v_owner_role_id
    where workspace_id = v_transfer.workspace_id
      and user_id = v_transfer.to_user_id
      and status = 'active';

    update public.workspace_transfers
    set status = 'accepted',
        accepted_at = now()
    where id = p_transfer_id;

    delete from public.user_notifications
    where transfer_id = p_transfer_id;
end;
$$;

revoke all on function public.finalize_workspace_transfer(uuid) from public;
grant execute on function public.finalize_workspace_transfer(uuid) to authenticated;

create or replace function public.cancel_workspace_transfer(
    p_transfer_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id uuid := auth.uid();
    v_transfer public.workspace_transfers%rowtype;
begin
    if v_user_id is null then
        raise exception 'unauthorized';
    end if;

    select *
    into v_transfer
    from public.workspace_transfers wt
    where wt.id = p_transfer_id;

    if v_transfer.id is null then
        raise exception 'transfer_not_found';
    end if;

    if v_transfer.status <> 'pending' then
        raise exception 'transfer_not_pending';
    end if;

    if v_transfer.from_user_id <> v_user_id and v_transfer.to_user_id <> v_user_id then
        raise exception 'forbidden';
    end if;

    update public.workspace_transfers
    set status = 'cancelled'
    where id = p_transfer_id;

    delete from public.user_notifications
    where transfer_id = p_transfer_id;
end;
$$;

revoke all on function public.cancel_workspace_transfer(uuid) from public;
grant execute on function public.cancel_workspace_transfer(uuid) to authenticated;

create or replace function public.get_pending_workspace_transfer(
    p_workspace_id uuid
)
returns table (
    transfer_id uuid,
    to_user_id uuid,
    recipient_confirmed_at timestamptz,
    status text
)
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id uuid := auth.uid();
begin
    if v_user_id is null then
        raise exception 'unauthorized';
    end if;

    return query
    select wt.id, wt.to_user_id, wt.recipient_confirmed_at, wt.status
    from public.workspace_transfers wt
    join public.workspaces w on w.id = wt.workspace_id
    where wt.workspace_id = p_workspace_id
      and wt.status = 'pending'
      and w.owner_id = v_user_id
    order by wt.created_at desc
    limit 1;
end;
$$;

revoke all on function public.get_pending_workspace_transfer(uuid) from public;
grant execute on function public.get_pending_workspace_transfer(uuid) to authenticated;

-- >>> 20260617120000_workspace_timezone.sql
-- Workspace default timezone for schedules, reports, and notifications.

alter table public.workspaces
    add column if not exists timezone text not null default 'UTC';

comment on column public.workspaces.timezone is
    'IANA timezone identifier used for workspace schedules, reports, and notifications.';

create or replace function public.normalize_workspace_timezone(p_timezone text)
returns text
language plpgsql
immutable
as $$
declare
    v_timezone text := nullif(trim(p_timezone), '');
begin
    if v_timezone is null then
        return 'UTC';
    end if;

    if v_timezone ~ '^[A-Za-z_]+/[A-Za-z0-9_+-]+$' then
        return v_timezone;
    end if;

    return 'UTC';
end;
$$;

create or replace function public.create_workspace_with_owner(
    p_name text,
    p_slug text,
    p_user_id uuid,
    p_profile jsonb default '{}'::jsonb,
    p_timezone text default 'UTC'
)
returns table (
    id uuid,
    name text,
    slug text,
    logo_url text,
    timezone text
)
language plpgsql
security definer
set search_path = public
as $$
declare
    v_workspace_id uuid;
    v_owner_role_id uuid;
    v_permission record;
    v_timezone text := public.normalize_workspace_timezone(p_timezone);
begin
    if auth.uid() is not null and auth.uid() <> p_user_id then
        raise exception 'unauthorized';
    end if;

    if exists (select 1 from public.workspaces w where w.slug = p_slug) then
        raise exception 'slug_taken';
    end if;

    insert into public.workspaces (name, slug, created_by, owner_id, timezone)
    values (p_name, p_slug, p_user_id, p_user_id, v_timezone)
    returning workspaces.id into v_workspace_id;

    insert into public.roles (workspace_id, slug, name, is_system)
    values (v_workspace_id, 'owner', 'Owner', true)
    returning roles.id into v_owner_role_id;

    for v_permission in
        select p.id from public.permissions p
    loop
        insert into public.role_permissions (role_id, permission_id)
        values (v_owner_role_id, v_permission.id)
        on conflict do nothing;
    end loop;

    insert into public.workspace_members (workspace_id, user_id, role_id, status)
    values (v_workspace_id, p_user_id, v_owner_role_id, 'active');

    if p_profile <> '{}'::jsonb then
        update public.profiles
        set
            first_name = coalesce(p_profile->>'first_name', first_name),
            last_name = coalesce(p_profile->>'last_name', last_name),
            position = coalesce(p_profile->>'position', position),
            country = coalesce(p_profile->>'country', country),
            gender = coalesce(p_profile->>'gender', gender),
            mobile = coalesce(p_profile->>'mobile', mobile),
            updated_at = now()
        where profiles.id = p_user_id;
    end if;

    return query
    select w.id, w.name, w.slug, w.logo_url, w.timezone
    from public.workspaces w
    where w.id = v_workspace_id;
end;
$$;

revoke all on function public.normalize_workspace_timezone(text) from public;
grant execute on function public.normalize_workspace_timezone(text) to authenticated;

revoke all on function public.create_workspace_with_owner(text, text, uuid, jsonb, text) from public;
grant execute on function public.create_workspace_with_owner(text, text, uuid, jsonb, text) to authenticated;

-- >>> 20260618120000_profile_timezone.sql
-- Personal IANA timezone for user notifications and schedules.

alter table public.profiles
    add column if not exists timezone text not null default 'UTC';

comment on column public.profiles.timezone is
    'Personal IANA timezone override for schedules and notifications.';

-- >>> 20260626120000_is_workspace_slug_available.sql
-- Global slug availability check for new users (RLS hides workspaces they are not members of).
create or replace function public.is_workspace_slug_available(
    p_slug text,
    p_exclude_workspace_id uuid default null
)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
    select not exists (
        select 1
        from public.workspaces w
        where w.slug = lower(trim(p_slug))
          and (p_exclude_workspace_id is null or w.id <> p_exclude_workspace_id)
    );
$$;

revoke all on function public.is_workspace_slug_available(text, uuid) from public;
grant execute on function public.is_workspace_slug_available(text, uuid) to authenticated;
grant execute on function public.is_workspace_slug_available(text, uuid) to anon;

-- >>> 20260627120000_drop_projects_and_project_analytics.sql
-- Remove retired onboarding goal slug from allowed values.
alter table public.workspaces
    drop constraint if exists workspaces_onboarding_goals_valid;

alter table public.workspaces
    add constraint workspaces_onboarding_goals_valid
    check (
        onboarding_goals <@ array[
            'team-collaboration',
            'track-performance',
            'automate-workflows'
        ]::text[]
    );

-- Strip legacy goal values from existing rows.
update public.workspaces
set onboarding_goals = array_remove(onboarding_goals, 'manage-projects')
where 'manage-projects' = any (onboarding_goals);

-- >>> 20260629120000_fix_account_deletion_without_integrations.sql
-- Remove workspace_integrations references from account deletion helpers
-- after 20260628120000_drop_workspace_integrations.sql.

create or replace function public.prepare_user_account_deletion(
    p_user_id uuid,
    p_delete_solo_workspaces boolean default false
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    v_workspace record;
    v_successor_user_id uuid;
    v_owner_role_id uuid;
begin
    if auth.uid() is not null and auth.uid() <> p_user_id then
        raise exception 'unauthorized';
    end if;

    for v_workspace in
        select w.id, w.name
        from public.workspaces w
        where w.owner_id = p_user_id
    loop
        select wm.user_id into v_successor_user_id
        from public.workspace_members wm
        join public.roles r on r.id = wm.role_id
        where wm.workspace_id = v_workspace.id
          and wm.status = 'active'
          and wm.user_id <> p_user_id
        order by (r.slug = 'admin') desc, wm.joined_at asc
        limit 1;

        if v_successor_user_id is null then
            if p_delete_solo_workspaces then
                delete from public.workspaces
                where id = v_workspace.id;
            else
                raise exception 'cannot_delete_solo_workspace_owner'
                    using detail = coalesce(v_workspace.name, v_workspace.id::text);
            end if;
        else
            select id into v_owner_role_id
            from public.roles
            where workspace_id = v_workspace.id
              and slug = 'owner';

            update public.workspaces
            set
                owner_id = v_successor_user_id,
                created_by = v_successor_user_id,
                updated_at = now()
            where id = v_workspace.id;

            update public.workspace_members
            set role_id = v_owner_role_id
            where workspace_id = v_workspace.id
              and user_id = v_successor_user_id;
        end if;
    end loop;

    update public.workspaces w
    set
        created_by = w.owner_id,
        updated_at = now()
    where w.created_by = p_user_id
      and w.owner_id <> p_user_id;

    update public.workspace_invites wi
    set invited_by = w.owner_id
    from public.workspaces w
    where wi.invited_by = p_user_id
      and wi.workspace_id = w.id;

    update public.workspace_join_links wjl
    set
        created_by = w.owner_id,
        status = case
            when wjl.status = 'active' then 'revoked'
            else wjl.status
        end
    from public.workspaces w
    where wjl.created_by = p_user_id
      and wjl.workspace_id = w.id;

    delete from public.workspace_transfers
    where from_user_id = p_user_id
       or to_user_id = p_user_id;
end;
$$;

revoke all on function public.prepare_user_account_deletion(uuid, boolean) from public;
grant execute on function public.prepare_user_account_deletion(uuid, boolean) to authenticated;
grant execute on function public.prepare_user_account_deletion(uuid, boolean) to service_role;

-- ---------------------------------------------------------------------------
-- Retired permissions cleanup
-- ---------------------------------------------------------------------------

-- Remove retired integration permissions (squashed from drop_workspace_integrations)
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

