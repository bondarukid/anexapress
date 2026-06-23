-- Structured solo-owned workspaces list for account deletion confirmation UI.

create or replace function public.get_solo_owned_workspaces(p_user_id uuid)
returns table (
    id uuid,
    name text,
    slug text,
    logo_url text
)
language sql
security definer
stable
set search_path = public
as $$
    select w.id, w.name, w.slug, w.logo_url
    from public.workspaces w
    where w.owner_id = p_user_id
      and not exists (
          select 1
          from public.workspace_members wm
          where wm.workspace_id = w.id
            and wm.status = 'active'
            and wm.user_id <> p_user_id
      )
    order by w.created_at asc;
$$;

revoke all on function public.get_solo_owned_workspaces(uuid) from public;
grant execute on function public.get_solo_owned_workspaces(uuid) to authenticated;
grant execute on function public.get_solo_owned_workspaces(uuid) to service_role;
