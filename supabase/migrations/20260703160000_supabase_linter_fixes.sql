-- Supabase database linter fixes:
-- - 0011_function_search_path_mutable
-- - 0006_multiple_permissive_policies

-- ---------------------------------------------------------------------------
-- 1. Pin search_path on flagged functions
-- ---------------------------------------------------------------------------

create or replace function public.normalize_workspace_timezone(p_timezone text)
returns text
language plpgsql
immutable
set search_path = public
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

create or replace function public.enforce_workspace_parent_is_root()
returns trigger
language plpgsql
set search_path = public
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

create or replace function public.set_posts_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create or replace function public.set_sites_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create or replace function public.set_site_pages_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create or replace function public.set_site_layouts_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 2. Public SELECT policies: anon only (authenticated uses *_select_member)
-- ---------------------------------------------------------------------------

alter policy "posts_select_public_published" on public.posts to anon;
alter policy "post_versions_select_public_published" on public.post_versions to anon;
alter policy "post_blocks_select_public_published" on public.post_blocks to anon;

alter policy "sites_select_public" on public.sites to anon;
alter policy "site_pages_select_public_published" on public.site_pages to anon;
alter policy "site_page_versions_select_public" on public.site_page_versions to anon;
alter policy "site_page_blocks_select_public" on public.site_page_blocks to anon;
alter policy "site_layouts_select_public" on public.site_layouts to anon;

alter policy "site_domains_select_public_resolve" on public.site_domains to anon;
alter policy "site_files_select_public" on public.site_files to anon;
