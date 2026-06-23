-- Workspace hierarchy: parent → child (single level).
-- Child workspaces have no user owner; parent workspace is the organizational owner.

-- ---------------------------------------------------------------------------
-- 1. Schema changes
-- ---------------------------------------------------------------------------

alter table public.workspaces
    add column if not exists parent_workspace_id uuid null
        references public.workspaces (id) on delete restrict;

comment on column public.workspaces.parent_workspace_id is
    'Parent workspace id for child workspaces. Only one level of nesting is allowed.';

alter table public.workspaces
    alter column owner_id drop not null;

alter table public.workspaces
    drop constraint if exists workspaces_slug_key;

create unique index if not exists workspaces_root_slug_key
    on public.workspaces (slug)
    where parent_workspace_id is null;

create unique index if not exists workspaces_child_slug_parent_key
    on public.workspaces (parent_workspace_id, slug)
    where parent_workspace_id is not null;

alter table public.workspaces
    drop constraint if exists workspaces_owner_parent_check;

alter table public.workspaces
    add constraint workspaces_owner_parent_check
    check (
        (parent_workspace_id is null and owner_id is not null)
        or (parent_workspace_id is not null and owner_id is null)
    );

alter table public.workspaces
    drop constraint if exists workspaces_parent_must_be_root;

-- Parent must be root (enforced via trigger; CHECK cannot use subqueries).
create or replace function public.enforce_workspace_parent_is_root()
returns trigger
language plpgsql
as $$
begin
    if new.parent_workspace_id is not null then
        if exists (
            select 1
            from public.workspaces parent_ws
            where parent_ws.id = new.parent_workspace_id
              and parent_ws.parent_workspace_id is not null
        ) then
            raise exception 'parent_must_be_root_workspace';
        end if;
    end if;
    return new;
end;
$$;

drop trigger if exists workspaces_parent_must_be_root on public.workspaces;

create trigger workspaces_parent_must_be_root
    before insert or update of parent_workspace_id
    on public.workspaces
    for each row
    execute function public.enforce_workspace_parent_is_root();

alter table public.workspace_members
    add column if not exists is_publicly_visible boolean not null default true;

comment on column public.workspace_members.is_publicly_visible is
    'When false, member is hidden from the public team list (child workspaces).';

-- ---------------------------------------------------------------------------
-- 2. New permissions
-- ---------------------------------------------------------------------------

insert into public.permissions (key, description)
values
    ('workspace.delete', 'Delete the workspace'),
    ('members.visibility', 'Change member public visibility in team lists')
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- 3. Helper functions
-- ---------------------------------------------------------------------------

create or replace function public.get_workspace_parent_id(ws_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
    select w.parent_workspace_id
    from public.workspaces w
    where w.id = ws_id;
$$;

revoke all on function public.get_workspace_parent_id(uuid) from public;
grant execute on function public.get_workspace_parent_id(uuid) to authenticated;

create or replace function public.is_workspace_child(ws_id uuid)
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
          and w.parent_workspace_id is not null
    );
$$;

revoke all on function public.is_workspace_child(uuid) from public;
grant execute on function public.is_workspace_child(uuid) to authenticated;

create or replace function public.has_effective_workspace_permission(ws_id uuid, perm_key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select
        public.has_workspace_permission(ws_id, perm_key)
        or (
            public.get_workspace_parent_id(ws_id) is not null
            and public.has_workspace_permission(
                public.get_workspace_parent_id(ws_id),
                perm_key
            )
        );
$$;

revoke all on function public.has_effective_workspace_permission(uuid, text) from public;
grant execute on function public.has_effective_workspace_permission(uuid, text) to authenticated;

create or replace function public.can_view_workspace(ws_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select
        public.is_workspace_member(ws_id)
        or (
            public.get_workspace_parent_id(ws_id) is not null
            and public.has_workspace_permission(
                public.get_workspace_parent_id(ws_id),
                'workspace.read'
            )
        );
$$;

revoke all on function public.can_view_workspace(uuid) from public;
grant execute on function public.can_view_workspace(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 4. Update system roles to include new permissions
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
            'workspace.delete',
            'members.invite',
            'members.remove',
            'members.visibility',
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

-- Grant new permissions to existing admin roles
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.slug = 'admin'
  and p.key in ('workspace.delete', 'members.visibility')
on conflict do nothing;

-- Grant new permissions to existing owner roles
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.slug = 'owner'
  and p.key in ('workspace.delete', 'members.visibility')
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- 5. Slug availability (scoped to parent)
-- ---------------------------------------------------------------------------

drop function if exists public.is_workspace_slug_available(text, uuid);

create or replace function public.is_workspace_slug_available(
    p_slug text,
    p_exclude_workspace_id uuid default null,
    p_parent_workspace_id uuid default null
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
          and (
            (p_parent_workspace_id is null and w.parent_workspace_id is null)
            or w.parent_workspace_id = p_parent_workspace_id
          )
    );
$$;

revoke all on function public.is_workspace_slug_available(text, uuid, uuid) from public;
grant execute on function public.is_workspace_slug_available(text, uuid, uuid) to authenticated;
grant execute on function public.is_workspace_slug_available(text, uuid, uuid) to anon;

-- ---------------------------------------------------------------------------
-- 6. RLS updates
-- ---------------------------------------------------------------------------

drop policy if exists "workspaces_select_member" on public.workspaces;

create policy "workspaces_select_member"
    on public.workspaces for select
    using (
        public.can_view_workspace(id)
        or exists (
            select 1
            from public.workspace_invites wi
            where wi.workspace_id = workspaces.id
              and lower(wi.email) = lower(coalesce((select auth.jwt()) ->> 'email', ''))
        )
    );

drop policy if exists "workspaces_update_owner_or_perm" on public.workspaces;

create policy "workspaces_update_owner_or_perm"
    on public.workspaces for update
    using (
        public.is_workspace_owner(id)
        or public.has_effective_workspace_permission(id, 'workspace.update')
    )
    with check (
        public.is_workspace_owner(id)
        or public.has_effective_workspace_permission(id, 'workspace.update')
    );

drop policy if exists "workspaces_delete_perm" on public.workspaces;

create policy "workspaces_delete_perm"
    on public.workspaces for delete
    using (
        public.has_effective_workspace_permission(id, 'workspace.delete')
    );

drop policy if exists "workspace_members_select_member" on public.workspace_members;

create policy "workspace_members_select_member"
    on public.workspace_members for select
    using (public.can_view_workspace(workspace_id));

-- ---------------------------------------------------------------------------
-- 7. Team members RPC (include visibility)
-- ---------------------------------------------------------------------------

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
    is_publicly_visible boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
    v_can_see_hidden boolean;
begin
    if not public.can_view_workspace(p_workspace_id) then
        raise exception 'forbidden';
    end if;

    perform public.ensure_workspace_system_roles(p_workspace_id);

    v_can_see_hidden :=
        public.has_effective_workspace_permission(p_workspace_id, 'members.visibility')
        or public.has_effective_workspace_permission(p_workspace_id, 'members.remove');

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
        wm.is_publicly_visible
    from public.workspace_members wm
    join auth.users u on u.id = wm.user_id
    left join public.profiles p on p.id = wm.user_id
    join public.roles r on r.id = wm.role_id
    join public.workspaces w on w.id = wm.workspace_id
    where wm.workspace_id = p_workspace_id
      and wm.status = 'active'
      and (
        wm.is_publicly_visible = true
        or wm.user_id = auth.uid()
        or v_can_see_hidden
      )
    order by (w.owner_id = wm.user_id) desc, wm.joined_at asc;
end;
$$;

revoke all on function public.get_workspace_team_members(uuid) from public;
grant execute on function public.get_workspace_team_members(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 8. Family members RPC (parent + children)
-- ---------------------------------------------------------------------------

create or replace function public.get_workspace_family_members(
    p_scope_workspace_id uuid,
    p_filter_workspace_id uuid default null
)
returns table (
    membership_id uuid,
    workspace_id uuid,
    workspace_name text,
    workspace_slug text,
    is_child_workspace boolean,
    user_id uuid,
    email text,
    first_name text,
    last_name text,
    avatar_url text,
    role_id uuid,
    role_slug text,
    role_name text,
    is_workspace_owner boolean,
    is_publicly_visible boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
    v_can_see_hidden boolean;
begin
    if not public.is_workspace_member(p_scope_workspace_id) then
        raise exception 'forbidden';
    end if;

    if exists (
        select 1 from public.workspaces w
        where w.id = p_scope_workspace_id
          and w.parent_workspace_id is not null
    ) then
        raise exception 'family_scope_requires_root_parent';
    end if;

    v_can_see_hidden :=
        public.has_workspace_permission(p_scope_workspace_id, 'members.visibility')
        or public.has_workspace_permission(p_scope_workspace_id, 'members.remove');

    return query
    select
        wm.id,
        w.id,
        w.name,
        w.slug,
        (w.parent_workspace_id is not null),
        wm.user_id,
        u.email::text,
        p.first_name,
        p.last_name,
        p.avatar_url,
        r.id,
        r.slug,
        r.name,
        (w.owner_id = wm.user_id),
        wm.is_publicly_visible
    from public.workspaces w
    join public.workspace_members wm on wm.workspace_id = w.id
    join auth.users u on u.id = wm.user_id
    left join public.profiles p on p.id = wm.user_id
    join public.roles r on r.id = wm.role_id
    where wm.status = 'active'
      and (
        w.id = p_scope_workspace_id
        or w.parent_workspace_id = p_scope_workspace_id
      )
      and (p_filter_workspace_id is null or w.id = p_filter_workspace_id)
      and (
        wm.is_publicly_visible = true
        or wm.user_id = auth.uid()
        or v_can_see_hidden
        or public.has_workspace_permission(w.id, 'members.visibility')
        or public.has_workspace_permission(w.id, 'members.remove')
      )
    order by (w.parent_workspace_id is null) desc, w.name asc, wm.joined_at asc;
end;
$$;

revoke all on function public.get_workspace_family_members(uuid, uuid) from public;
grant execute on function public.get_workspace_family_members(uuid, uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 9. Create child workspace
-- ---------------------------------------------------------------------------

create or replace function public.create_child_workspace(
    p_parent_id uuid,
    p_name text,
    p_slug text,
    p_timezone text default 'UTC'
)
returns table (
    id uuid,
    name text,
    slug text,
    logo_url text,
    timezone text,
    parent_workspace_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id uuid := auth.uid();
    v_workspace_id uuid;
    v_admin_role_id uuid;
    v_timezone text := public.normalize_workspace_timezone(p_timezone);
    v_slug text := lower(trim(p_slug));
    v_is_parent_member boolean;
begin
    if v_user_id is null then
        raise exception 'unauthorized';
    end if;

    if not exists (
        select 1 from public.workspaces w
        where w.id = p_parent_id
          and w.parent_workspace_id is null
    ) then
        raise exception 'parent_must_be_root';
    end if;

    if not public.has_workspace_permission(p_parent_id, 'workspace.update') then
        raise exception 'forbidden';
    end if;

    if not public.is_workspace_slug_available(v_slug, null, p_parent_id) then
        raise exception 'slug_taken';
    end if;

    insert into public.workspaces (name, slug, created_by, owner_id, timezone, parent_workspace_id)
    values (trim(p_name), v_slug, v_user_id, null, v_timezone, p_parent_id)
    returning workspaces.id into v_workspace_id;

    perform public.ensure_workspace_system_roles(v_workspace_id);

    select r.id into v_admin_role_id
    from public.roles r
    where r.workspace_id = v_workspace_id
      and r.slug = 'admin';

    select exists (
        select 1
        from public.workspace_members wm
        where wm.workspace_id = p_parent_id
          and wm.user_id = v_user_id
          and wm.status = 'active'
    ) into v_is_parent_member;

    insert into public.workspace_members (
        workspace_id,
        user_id,
        role_id,
        status,
        is_publicly_visible
    )
    values (
        v_workspace_id,
        v_user_id,
        v_admin_role_id,
        'active',
        not v_is_parent_member
    );

    return query
    select w.id, w.name, w.slug, w.logo_url, w.timezone, w.parent_workspace_id
    from public.workspaces w
    where w.id = v_workspace_id;
end;
$$;

revoke all on function public.create_child_workspace(uuid, text, text, text) from public;
grant execute on function public.create_child_workspace(uuid, text, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- 10. Attach existing root workspace to parent
-- ---------------------------------------------------------------------------

create or replace function public.attach_workspace_to_parent(
    p_workspace_id uuid,
    p_parent_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id uuid := auth.uid();
    v_owned_roots integer;
    v_admin_role_id uuid;
    v_is_parent_member boolean;
begin
    if v_user_id is null then
        raise exception 'unauthorized';
    end if;

    if p_workspace_id = p_parent_id then
        raise exception 'cannot_attach_to_self';
    end if;

    if not exists (
        select 1 from public.workspaces w
        where w.id = p_workspace_id
          and w.parent_workspace_id is null
          and w.owner_id = v_user_id
    ) then
        raise exception 'source_must_be_owned_root';
    end if;

    select count(*)::integer into v_owned_roots
    from public.workspaces w
    where w.owner_id = v_user_id
      and w.parent_workspace_id is null;

    if v_owned_roots < 2 then
        raise exception 'must_own_another_root_workspace';
    end if;

    if not exists (
        select 1 from public.workspaces w
        where w.id = p_parent_id
          and w.parent_workspace_id is null
    ) then
        raise exception 'parent_must_be_root';
    end if;

    if not public.has_workspace_permission(p_parent_id, 'workspace.update') then
        raise exception 'forbidden';
    end if;

    update public.workspaces
    set
        parent_workspace_id = p_parent_id,
        owner_id = null,
        updated_at = now()
    where id = p_workspace_id;

    select exists (
        select 1
        from public.workspace_members wm
        where wm.workspace_id = p_parent_id
          and wm.user_id = v_user_id
          and wm.status = 'active'
    ) into v_is_parent_member;

    if v_is_parent_member then
        update public.workspace_members wm
        set is_publicly_visible = false
        where wm.workspace_id = p_workspace_id
          and wm.user_id = v_user_id
          and wm.status = 'active';
    end if;

    select r.id into v_admin_role_id
    from public.roles r
    where r.workspace_id = p_workspace_id
      and r.slug = 'admin';

    if v_admin_role_id is not null then
        update public.workspace_members wm
        set role_id = v_admin_role_id
        where wm.workspace_id = p_workspace_id
          and wm.user_id = v_user_id
          and wm.status = 'active';
    end if;
end;
$$;

revoke all on function public.attach_workspace_to_parent(uuid, uuid) from public;
grant execute on function public.attach_workspace_to_parent(uuid, uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 11. Update member visibility
-- ---------------------------------------------------------------------------

create or replace function public.update_member_visibility(
    p_membership_id uuid,
    p_visible boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    v_workspace_id uuid;
    v_user_id uuid;
    v_member_user_id uuid;
begin
    if auth.uid() is null then
        raise exception 'unauthorized';
    end if;

    select wm.workspace_id, wm.user_id
    into v_workspace_id, v_member_user_id
    from public.workspace_members wm
    where wm.id = p_membership_id
      and wm.status = 'active';

    if v_workspace_id is null then
        raise exception 'membership_not_found';
    end if;

    if not public.is_workspace_child(v_workspace_id) then
        raise exception 'visibility_only_for_child_workspaces';
    end if;

    if v_member_user_id = auth.uid() then
        null;
    elsif not public.has_effective_workspace_permission(v_workspace_id, 'members.visibility') then
        raise exception 'forbidden';
    end if;

    update public.workspace_members
    set is_publicly_visible = p_visible
    where id = p_membership_id;
end;
$$;

revoke all on function public.update_member_visibility(uuid, boolean) from public;
grant execute on function public.update_member_visibility(uuid, boolean) to authenticated;

-- ---------------------------------------------------------------------------
-- 12. List child workspaces for a parent
-- ---------------------------------------------------------------------------

create or replace function public.get_child_workspaces(p_parent_id uuid)
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
begin
    if not public.can_view_workspace(p_parent_id) then
        raise exception 'forbidden';
    end if;

    return query
    select w.id, w.name, w.slug, w.logo_url, w.timezone
    from public.workspaces w
    where w.parent_workspace_id = p_parent_id
    order by w.name asc;
end;
$$;

revoke all on function public.get_child_workspaces(uuid) from public;
grant execute on function public.get_child_workspaces(uuid) to authenticated;
