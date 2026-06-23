-- Bilateral parent attach flow: dual confirmation between source transfer holder and parent acceptor.

-- ---------------------------------------------------------------------------
-- 1. Extend workspace_transfers
-- ---------------------------------------------------------------------------

alter table public.workspace_transfers
    add column if not exists kind text not null default 'ownership';

alter table public.workspace_transfers
    add column if not exists parent_workspace_id uuid null references public.workspaces (id) on delete cascade;

alter table public.workspace_transfers
    drop constraint if exists workspace_transfers_kind_check;

alter table public.workspace_transfers
    add constraint workspace_transfers_kind_check
    check (kind in ('ownership', 'parent_attach'));

alter table public.workspace_transfers
    drop constraint if exists workspace_transfers_parent_attach_parent_check;

alter table public.workspace_transfers
    add constraint workspace_transfers_parent_attach_parent_check
    check (
        (kind = 'parent_attach' and parent_workspace_id is not null)
        or (kind = 'ownership' and parent_workspace_id is null)
    );

drop index if exists public.idx_workspace_transfers_one_pending;

create unique index idx_workspace_transfers_one_pending
    on public.workspace_transfers (workspace_id, kind)
    where status = 'pending';

-- ---------------------------------------------------------------------------
-- 2. Permission: accept child attach on parent workspace
-- ---------------------------------------------------------------------------

insert into public.permissions (key, description)
values ('workspace.accept_child', 'Accept attaching a workspace as a child')
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- 3. Notifications kind
-- ---------------------------------------------------------------------------

alter table public.user_notifications
    drop constraint if exists user_notifications_kind_check;

alter table public.user_notifications
    add constraint user_notifications_kind_check
    check (kind in (
        'workspace_invite',
        'workspace_transfer',
        'workspace_parent_attach',
        'system.invite_sent',
        'system.invite_revoked',
        'system.invite_revoked_invitee',
        'system.invite_accepted',
        'system.invite_declined'
    ));

-- ---------------------------------------------------------------------------
-- 4. Ownership transfer RPCs: set kind explicitly, filter by kind
-- ---------------------------------------------------------------------------

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
          and wt.kind = 'ownership'
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
        token,
        kind,
        parent_workspace_id
    )
    values (
        p_workspace_id,
        v_from_user_id,
        p_to_user_id,
        'pending',
        v_token,
        'ownership',
        null
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

    if v_transfer.kind <> 'ownership' then
        raise exception 'invalid_transfer_kind';
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

    if v_transfer.kind <> 'ownership' then
        raise exception 'invalid_transfer_kind';
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

    if v_transfer.kind <> 'ownership' then
        raise exception 'invalid_transfer_kind';
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
      and wt.kind = 'ownership'
      and wt.status = 'pending'
      and w.owner_id = v_user_id
    order by wt.created_at desc
    limit 1;
end;
$$;

-- ---------------------------------------------------------------------------
-- 5. Helper: permission check for a specific user (not only auth.uid())
-- ---------------------------------------------------------------------------

create or replace function public.user_has_workspace_permission(
    p_user_id uuid,
    p_workspace_id uuid,
    p_perm_key text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.workspace_members wm
        join public.workspaces w on w.id = wm.workspace_id
        where wm.workspace_id = p_workspace_id
          and wm.user_id = p_user_id
          and wm.status = 'active'
          and (
            w.owner_id = p_user_id
            or (
                wm.uses_custom_permissions = true
                and exists (
                    select 1
                    from public.workspace_member_permissions wmp
                    join public.permissions p on p.id = wmp.permission_id
                    where wmp.membership_id = wm.id
                      and p.key = p_perm_key
                )
            )
            or (
                wm.uses_custom_permissions = false
                and exists (
                    select 1
                    from public.role_permissions rp
                    join public.permissions p on p.id = rp.permission_id
                    where rp.role_id = wm.role_id
                      and p.key = p_perm_key
                )
            )
          )
    );
$$;

revoke all on function public.user_has_workspace_permission(uuid, uuid, text) from public;
grant execute on function public.user_has_workspace_permission(uuid, uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- 6. Internal: execute attach after bilateral confirmation
-- ---------------------------------------------------------------------------

create or replace function public._execute_workspace_parent_attach(
    p_workspace_id uuid,
    p_parent_id uuid,
    p_initiator_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    v_admin_role_id uuid;
    v_is_parent_member boolean;
begin
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
          and wm.user_id = p_initiator_user_id
          and wm.status = 'active'
    ) into v_is_parent_member;

    if v_is_parent_member then
        update public.workspace_members wm
        set is_publicly_visible = false
        where wm.workspace_id = p_workspace_id
          and wm.user_id = p_initiator_user_id
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
          and wm.user_id = p_initiator_user_id
          and wm.status = 'active';
    end if;
end;
$$;

revoke all on function public._execute_workspace_parent_attach(uuid, uuid, uuid) from public;

-- ---------------------------------------------------------------------------
-- 7. Parent attach RPCs
-- ---------------------------------------------------------------------------

create or replace function public.initiate_workspace_parent_attach(
    p_source_id uuid,
    p_parent_id uuid,
    p_acceptor_user_id uuid
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
    v_source_name text;
    v_parent_name text;
    v_transfer_id uuid;
    v_token text;
    v_from_name text;
    v_root_memberships integer;
begin
    if v_from_user_id is null then
        raise exception 'unauthorized';
    end if;

    if p_source_id = p_parent_id then
        raise exception 'cannot_attach_to_self';
    end if;

    if not public.has_workspace_permission(p_source_id, 'workspace.transfer') then
        raise exception 'forbidden';
    end if;

    if not exists (
        select 1 from public.workspaces w
        where w.id = p_source_id
          and w.parent_workspace_id is null
    ) then
        raise exception 'source_must_be_root';
    end if;

    select count(*)::integer into v_root_memberships
    from public.workspace_members wm
    join public.workspaces w on w.id = wm.workspace_id
    where wm.user_id = v_from_user_id
      and wm.status = 'active'
      and w.parent_workspace_id is null;

    if v_root_memberships < 2 then
        raise exception 'must_have_another_root_workspace';
    end if;

    if not exists (
        select 1 from public.workspaces w
        where w.id = p_parent_id
          and w.parent_workspace_id is null
    ) then
        raise exception 'parent_must_be_root';
    end if;

    if not exists (
        select 1
        from public.workspace_members wm
        where wm.workspace_id = p_parent_id
          and wm.user_id = p_acceptor_user_id
          and wm.status = 'active'
    ) then
        raise exception 'acceptor_must_have_permission';
    end if;

    if not public.user_has_workspace_permission(p_acceptor_user_id, p_parent_id, 'workspace.accept_child') then
        raise exception 'acceptor_must_have_permission';
    end if;

    if exists (
        select 1
        from public.workspace_transfers wt
        where wt.workspace_id = p_source_id
          and wt.kind = 'parent_attach'
          and wt.status = 'pending'
    ) then
        raise exception 'attach_already_pending';
    end if;

    select w.name into v_source_name from public.workspaces w where w.id = p_source_id;
    select w.name into v_parent_name from public.workspaces w where w.id = p_parent_id;

    v_token := encode(gen_random_bytes(24), 'hex');

    insert into public.workspace_transfers (
        workspace_id,
        from_user_id,
        to_user_id,
        status,
        token,
        kind,
        parent_workspace_id
    )
    values (
        p_source_id,
        v_from_user_id,
        p_acceptor_user_id,
        'pending',
        v_token,
        'parent_attach',
        p_parent_id
    )
    returning id into v_transfer_id;

    select coalesce(nullif(trim(concat_ws(' ', p.first_name, p.last_name)), ''), u.email)
    into v_from_name
    from auth.users u
    left join public.profiles p on p.id = u.id
    where u.id = v_from_user_id;

    perform public.insert_user_notification(
        p_acceptor_user_id,
        'workspace_parent_attach',
        'Workspace attach request',
        coalesce(v_from_name, 'A team member') || ' wants to attach '
            || coalesce(v_source_name, 'a workspace') || ' under '
            || coalesce(v_parent_name, 'this parent') || '. Review and accept the request.',
        null,
        v_transfer_id
    );

    return query select v_transfer_id, v_token;
end;
$$;

revoke all on function public.initiate_workspace_parent_attach(uuid, uuid, uuid) from public;
grant execute on function public.initiate_workspace_parent_attach(uuid, uuid, uuid) to authenticated;

create or replace function public.confirm_workspace_parent_attach_recipient(
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
    v_source_name text;
    v_parent_name text;
    v_acceptor_name text;
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

    if v_transfer.kind <> 'parent_attach' then
        raise exception 'invalid_transfer_kind';
    end if;

    if v_transfer.status <> 'pending' then
        raise exception 'transfer_not_pending';
    end if;

    if v_transfer.to_user_id <> v_user_id then
        raise exception 'forbidden';
    end if;

    if not public.user_has_workspace_permission(v_user_id, v_transfer.parent_workspace_id, 'workspace.accept_child') then
        raise exception 'forbidden';
    end if;

    update public.workspace_transfers
    set recipient_confirmed_at = now()
    where id = p_transfer_id;

    select w.name into v_source_name
    from public.workspaces w
    where w.id = v_transfer.workspace_id;

    select w.name into v_parent_name
    from public.workspaces w
    where w.id = v_transfer.parent_workspace_id;

    select coalesce(nullif(trim(concat_ws(' ', p.first_name, p.last_name)), ''), u.email)
    into v_acceptor_name
    from auth.users u
    left join public.profiles p on p.id = u.id
    where u.id = v_user_id;

    perform public.insert_user_notification(
        v_transfer.from_user_id,
        'workspace_parent_attach',
        'Attach ready to finalize',
        coalesce(v_acceptor_name, 'The parent representative')
            || ' accepted attaching '
            || coalesce(v_source_name, 'the workspace')
            || ' under '
            || coalesce(v_parent_name, 'the parent')
            || '. Confirm to complete the attach.',
        null,
        p_transfer_id
    );
end;
$$;

revoke all on function public.confirm_workspace_parent_attach_recipient(uuid) from public;
grant execute on function public.confirm_workspace_parent_attach_recipient(uuid) to authenticated;

create or replace function public.finalize_workspace_parent_attach(
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

    if v_transfer.kind <> 'parent_attach' then
        raise exception 'invalid_transfer_kind';
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

    perform public._execute_workspace_parent_attach(
        v_transfer.workspace_id,
        v_transfer.parent_workspace_id,
        v_transfer.from_user_id
    );

    update public.workspace_transfers
    set status = 'accepted',
        accepted_at = now()
    where id = p_transfer_id;

    delete from public.user_notifications
    where transfer_id = p_transfer_id;
end;
$$;

revoke all on function public.finalize_workspace_parent_attach(uuid) from public;
grant execute on function public.finalize_workspace_parent_attach(uuid) to authenticated;

create or replace function public.cancel_workspace_parent_attach(
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

    if v_transfer.kind <> 'parent_attach' then
        raise exception 'invalid_transfer_kind';
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

revoke all on function public.cancel_workspace_parent_attach(uuid) from public;
grant execute on function public.cancel_workspace_parent_attach(uuid) to authenticated;

create or replace function public.get_pending_workspace_parent_attach(
    p_parent_id uuid
)
returns table (
    transfer_id uuid,
    source_workspace_id uuid,
    source_workspace_name text,
    source_workspace_slug text,
    parent_workspace_id uuid,
    acceptor_user_id uuid,
    acceptor_display_name text,
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
    select
        wt.id,
        wt.workspace_id,
        sw.name,
        sw.slug,
        wt.parent_workspace_id,
        wt.to_user_id,
        coalesce(
            nullif(trim(concat_ws(' ', ap.first_name, ap.last_name)), ''),
            au.email,
            'Unknown'
        ),
        wt.recipient_confirmed_at,
        wt.status
    from public.workspace_transfers wt
    join public.workspaces sw on sw.id = wt.workspace_id
    left join auth.users au on au.id = wt.to_user_id
    left join public.profiles ap on ap.id = wt.to_user_id
    where wt.parent_workspace_id = p_parent_id
      and wt.kind = 'parent_attach'
      and wt.status = 'pending'
      and wt.from_user_id = v_user_id
    order by wt.created_at desc
    limit 1;
end;
$$;

revoke all on function public.get_pending_workspace_parent_attach(uuid) from public;
grant execute on function public.get_pending_workspace_parent_attach(uuid) to authenticated;

create or replace function public.get_parent_attach_acceptors(
    p_parent_id uuid
)
returns table (
    user_id uuid,
    email text,
    display_name text,
    role_slug text,
    role_label text,
    is_owner boolean,
    avatar_url text
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

    if not public.is_workspace_member(p_parent_id) then
        raise exception 'forbidden';
    end if;

    return query
    select
        wm.user_id,
        u.email::text,
        coalesce(nullif(trim(concat_ws(' ', p.first_name, p.last_name)), ''), u.email)::text,
        r.slug,
        r.name,
        (w.owner_id = wm.user_id) as is_owner,
        p.avatar_url
    from public.workspace_members wm
    join public.roles r on r.id = wm.role_id
    join public.workspaces w on w.id = wm.workspace_id
    join auth.users u on u.id = wm.user_id
    left join public.profiles p on p.id = wm.user_id
    where wm.workspace_id = p_parent_id
      and wm.status = 'active'
      and public.user_has_workspace_permission(wm.user_id, p_parent_id, 'workspace.accept_child')
    order by (w.owner_id = wm.user_id) desc, r.slug, display_name;
end;
$$;

revoke all on function public.get_parent_attach_acceptors(uuid) from public;
grant execute on function public.get_parent_attach_acceptors(uuid) to authenticated;

create or replace function public.get_attachable_root_workspaces(
    p_exclude_parent_id uuid
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
    v_user_id uuid := auth.uid();
begin
    if v_user_id is null then
        raise exception 'unauthorized';
    end if;

    return query
    select w.id, w.name, w.slug, w.logo_url, w.timezone
    from public.workspaces w
  join public.workspace_members wm on wm.workspace_id = w.id
    where wm.user_id = v_user_id
      and wm.status = 'active'
      and w.parent_workspace_id is null
      and w.id <> p_exclude_parent_id
      and public.user_has_workspace_permission(v_user_id, w.id, 'workspace.transfer')
    order by w.name;
end;
$$;

revoke all on function public.get_attachable_root_workspaces(uuid) from public;
grant execute on function public.get_attachable_root_workspaces(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 8. Deprecate direct attach
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
begin
    raise exception 'use_parent_attach_flow';
end;
$$;

revoke all on function public.attach_workspace_to_parent(uuid, uuid) from public;
