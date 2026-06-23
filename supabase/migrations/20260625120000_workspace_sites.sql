-- Multi-site CMS: sites, site pages, layouts; extend posts with site_id.

-- ---------------------------------------------------------------------------
-- sites
-- ---------------------------------------------------------------------------

create table public.sites (
    id uuid primary key default gen_random_uuid(),
    workspace_id uuid not null references public.workspaces (id) on delete cascade,
    name text not null,
    slug text not null,
    is_default boolean not null default false,
    primary_domain text,
    home_page_id uuid,
    seo_default_title text,
    seo_default_description text,
    seo_default_og_image_id uuid references public.media_files (id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint sites_workspace_slug_unique unique (workspace_id, slug)
);

create unique index sites_one_default_per_workspace
    on public.sites (workspace_id)
    where is_default = true;

create index sites_workspace_id_idx on public.sites (workspace_id);

-- ---------------------------------------------------------------------------
-- site_pages
-- ---------------------------------------------------------------------------

create table public.site_pages (
    id uuid primary key default gen_random_uuid(),
    site_id uuid not null references public.sites (id) on delete cascade,
    slug text not null,
    type text not null check (type in ('page', 'blog_index', 'system')),
    title text not null,
    status text not null default 'draft'
        check (status in ('draft', 'published', 'archived')),
    seo_title text,
    seo_description text,
    seo_canonical text,
    seo_keywords text[] not null default '{}',
    og_image_id uuid references public.media_files (id) on delete set null,
    current_draft_version_id uuid,
    published_version_id uuid,
    created_by uuid not null references auth.users (id),
    updated_by uuid references auth.users (id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint site_pages_site_slug_unique unique (site_id, slug)
);

create index site_pages_site_id_idx on public.site_pages (site_id);
create index site_pages_site_status_idx on public.site_pages (site_id, status);

-- ---------------------------------------------------------------------------
-- site_page_versions
-- ---------------------------------------------------------------------------

create table public.site_page_versions (
    id uuid primary key default gen_random_uuid(),
    page_id uuid not null references public.site_pages (id) on delete cascade,
    version int not null default 0,
    kind text not null check (kind in ('draft', 'snapshot', 'published')),
    is_current boolean not null default false,
    content jsonb not null default '{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb,
    title text not null,
    seo_snapshot jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    created_by uuid not null references auth.users (id),
    constraint site_page_versions_page_version_unique unique (page_id, version, kind)
);

create unique index site_page_versions_one_draft_per_page
    on public.site_page_versions (page_id)
    where kind = 'draft';

create index site_page_versions_page_id_idx on public.site_page_versions (page_id, created_at desc);

alter table public.site_pages
    add constraint site_pages_current_draft_version_id_fkey
        foreign key (current_draft_version_id) references public.site_page_versions (id) on delete set null;

alter table public.site_pages
    add constraint site_pages_published_version_id_fkey
        foreign key (published_version_id) references public.site_page_versions (id) on delete set null;

alter table public.sites
    add constraint sites_home_page_id_fkey
        foreign key (home_page_id) references public.site_pages (id) on delete set null;

-- ---------------------------------------------------------------------------
-- site_page_blocks (denormalized)
-- ---------------------------------------------------------------------------

create table public.site_page_blocks (
    id uuid primary key default gen_random_uuid(),
    page_id uuid not null references public.site_pages (id) on delete cascade,
    version_id uuid not null references public.site_page_versions (id) on delete cascade,
    parent_id uuid references public.site_page_blocks (id) on delete cascade,
    sort_order int not null default 0,
    type text not null,
    attrs jsonb not null default '{}'::jsonb,
    content jsonb not null default '[]'::jsonb,
    created_at timestamptz not null default now()
);

create index site_page_blocks_version_id_idx on public.site_page_blocks (version_id, sort_order);

-- ---------------------------------------------------------------------------
-- site_layouts
-- ---------------------------------------------------------------------------

create table public.site_layouts (
    id uuid primary key default gen_random_uuid(),
    site_id uuid not null references public.sites (id) on delete cascade,
    header_config jsonb not null default '{}'::jsonb,
    footer_config jsonb not null default '{}'::jsonb,
    theme_config jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint site_layouts_site_id_unique unique (site_id)
);

-- ---------------------------------------------------------------------------
-- extend posts
-- ---------------------------------------------------------------------------

alter table public.posts
    add column site_id uuid references public.sites (id) on delete cascade,
    add column blog_page_id uuid references public.site_pages (id) on delete set null;

create index posts_site_id_idx on public.posts (site_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.sites enable row level security;
alter table public.site_pages enable row level security;
alter table public.site_page_versions enable row level security;
alter table public.site_page_blocks enable row level security;
alter table public.site_layouts enable row level security;

-- sites
create policy "sites_select_member"
    on public.sites for select
    to authenticated
    using (public.can_view_workspace(workspace_id));

create policy "sites_select_public"
    on public.sites for select
    to anon, authenticated
    using (public.can_view_workspace(workspace_id));

create policy "sites_insert_content_create"
    on public.sites for insert
    to authenticated
    with check (public.has_effective_workspace_permission(workspace_id, 'content.create'));

create policy "sites_update_content_create"
    on public.sites for update
    to authenticated
    using (public.has_effective_workspace_permission(workspace_id, 'content.create'))
    with check (public.has_effective_workspace_permission(workspace_id, 'content.create'));

create policy "sites_delete_content_create"
    on public.sites for delete
    to authenticated
    using (public.has_effective_workspace_permission(workspace_id, 'content.create'));

-- site_pages
create policy "site_pages_select_member"
    on public.site_pages for select
    to authenticated
    using (
        exists (
            select 1 from public.sites s
            where s.id = site_pages.site_id
              and public.can_view_workspace(s.workspace_id)
        )
    );

create policy "site_pages_select_public_published"
    on public.site_pages for select
    to anon, authenticated
    using (
        status = 'published'
        and exists (
            select 1 from public.sites s
            where s.id = site_pages.site_id
              and public.can_view_workspace(s.workspace_id)
        )
    );

create policy "site_pages_insert_content_create"
    on public.site_pages for insert
    to authenticated
    with check (
        exists (
            select 1 from public.sites s
            where s.id = site_pages.site_id
              and public.has_effective_workspace_permission(s.workspace_id, 'content.create')
        )
    );

create policy "site_pages_update_content_create"
    on public.site_pages for update
    to authenticated
    using (
        exists (
            select 1 from public.sites s
            where s.id = site_pages.site_id
              and public.has_effective_workspace_permission(s.workspace_id, 'content.create')
        )
    )
    with check (
        exists (
            select 1 from public.sites s
            where s.id = site_pages.site_id
              and public.has_effective_workspace_permission(s.workspace_id, 'content.create')
        )
    );

create policy "site_pages_delete_content_create"
    on public.site_pages for delete
    to authenticated
    using (
        exists (
            select 1 from public.sites s
            where s.id = site_pages.site_id
              and public.has_effective_workspace_permission(s.workspace_id, 'content.create')
        )
    );

-- site_page_versions
create policy "site_page_versions_select_member"
    on public.site_page_versions for select
    to authenticated
    using (
        exists (
            select 1 from public.site_pages p
            join public.sites s on s.id = p.site_id
            where p.id = site_page_versions.page_id
              and public.can_view_workspace(s.workspace_id)
        )
    );

create policy "site_page_versions_select_public"
    on public.site_page_versions for select
    to anon, authenticated
    using (
        exists (
            select 1 from public.site_pages p
            join public.sites s on s.id = p.site_id
            where p.id = site_page_versions.page_id
              and p.status = 'published'
              and p.published_version_id = site_page_versions.id
              and public.can_view_workspace(s.workspace_id)
        )
    );

create policy "site_page_versions_insert_content_create"
    on public.site_page_versions for insert
    to authenticated
    with check (
        exists (
            select 1 from public.site_pages p
            join public.sites s on s.id = p.site_id
            where p.id = site_page_versions.page_id
              and public.has_effective_workspace_permission(s.workspace_id, 'content.create')
        )
    );

create policy "site_page_versions_update_content_create"
    on public.site_page_versions for update
    to authenticated
    using (
        exists (
            select 1 from public.site_pages p
            join public.sites s on s.id = p.site_id
            where p.id = site_page_versions.page_id
              and public.has_effective_workspace_permission(s.workspace_id, 'content.create')
        )
    );

create policy "site_page_versions_delete_content_create"
    on public.site_page_versions for delete
    to authenticated
    using (
        exists (
            select 1 from public.site_pages p
            join public.sites s on s.id = p.site_id
            where p.id = site_page_versions.page_id
              and public.has_effective_workspace_permission(s.workspace_id, 'content.create')
        )
    );

-- site_page_blocks
create policy "site_page_blocks_select_member"
    on public.site_page_blocks for select
    to authenticated
    using (
        exists (
            select 1 from public.site_pages p
            join public.sites s on s.id = p.site_id
            where p.id = site_page_blocks.page_id
              and public.can_view_workspace(s.workspace_id)
        )
    );

create policy "site_page_blocks_select_public"
    on public.site_page_blocks for select
    to anon, authenticated
    using (
        exists (
            select 1 from public.site_pages p
            join public.sites s on s.id = p.site_id
            where p.id = site_page_blocks.page_id
              and p.status = 'published'
              and p.published_version_id = site_page_blocks.version_id
              and public.can_view_workspace(s.workspace_id)
        )
    );

create policy "site_page_blocks_insert_content_create"
    on public.site_page_blocks for insert
    to authenticated
    with check (
        exists (
            select 1 from public.site_pages p
            join public.sites s on s.id = p.site_id
            where p.id = site_page_blocks.page_id
              and public.has_effective_workspace_permission(s.workspace_id, 'content.create')
        )
    );

create policy "site_page_blocks_update_content_create"
    on public.site_page_blocks for update
    to authenticated
    using (
        exists (
            select 1 from public.site_pages p
            join public.sites s on s.id = p.site_id
            where p.id = site_page_blocks.page_id
              and public.has_effective_workspace_permission(s.workspace_id, 'content.create')
        )
    );

create policy "site_page_blocks_delete_content_create"
    on public.site_page_blocks for delete
    to authenticated
    using (
        exists (
            select 1 from public.site_pages p
            join public.sites s on s.id = p.site_id
            where p.id = site_page_blocks.page_id
              and public.has_effective_workspace_permission(s.workspace_id, 'content.create')
        )
    );

-- site_layouts
create policy "site_layouts_select_member"
    on public.site_layouts for select
    to authenticated
    using (
        exists (
            select 1 from public.sites s
            where s.id = site_layouts.site_id
              and public.can_view_workspace(s.workspace_id)
        )
    );

create policy "site_layouts_select_public"
    on public.site_layouts for select
    to anon, authenticated
    using (
        exists (
            select 1 from public.sites s
            where s.id = site_layouts.site_id
              and public.can_view_workspace(s.workspace_id)
        )
    );

create policy "site_layouts_insert_content_create"
    on public.site_layouts for insert
    to authenticated
    with check (
        exists (
            select 1 from public.sites s
            where s.id = site_layouts.site_id
              and public.has_effective_workspace_permission(s.workspace_id, 'content.create')
        )
    );

create policy "site_layouts_update_content_create"
    on public.site_layouts for update
    to authenticated
    using (
        exists (
            select 1 from public.sites s
            where s.id = site_layouts.site_id
              and public.has_effective_workspace_permission(s.workspace_id, 'content.create')
        )
    );

create policy "site_layouts_delete_content_create"
    on public.site_layouts for delete
    to authenticated
    using (
        exists (
            select 1 from public.sites s
            where s.id = site_layouts.site_id
              and public.has_effective_workspace_permission(s.workspace_id, 'content.create')
        )
    );

-- ---------------------------------------------------------------------------
-- RPC: provision_default_site
-- ---------------------------------------------------------------------------

create or replace function public.provision_default_site(
    p_workspace_id uuid,
    p_user_id uuid default auth.uid()
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_site_id uuid;
    v_blog_page_id uuid;
    v_version_id uuid;
    v_empty_doc jsonb := '{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb;
    v_default_header jsonb := '{
        "logo": {"text": "My Site"},
        "nav": [{"label": "Blog", "pageSlug": "blog"}],
        "showAuthLinks": false
    }'::jsonb;
    v_default_footer jsonb := '{
        "tagline": "",
        "columns": [],
        "socials": [],
        "copyright": ""
    }'::jsonb;
begin
    if p_user_id is null then
        raise exception 'Not authenticated';
    end if;

    if exists (select 1 from public.sites where workspace_id = p_workspace_id and is_default = true) then
        select id into v_site_id
        from public.sites
        where workspace_id = p_workspace_id and is_default = true
        limit 1;
        return v_site_id;
    end if;

    insert into public.sites (workspace_id, name, slug, is_default)
    values (p_workspace_id, 'Main site', 'main', true)
    returning id into v_site_id;

    insert into public.site_layouts (site_id, header_config, footer_config, theme_config)
    values (v_site_id, v_default_header, v_default_footer, '{}'::jsonb);

    insert into public.site_pages (
        site_id, slug, type, title, status, created_by, updated_by
    )
    values (
        v_site_id, 'blog', 'blog_index', 'Blog', 'published', p_user_id, p_user_id
    )
    returning id into v_blog_page_id;

    insert into public.site_page_versions (
        page_id, version, kind, is_current, content, title, seo_snapshot, created_by
    )
    values (
        v_blog_page_id, 0, 'draft', true, v_empty_doc, 'Blog', '{}'::jsonb, p_user_id
    )
    returning id into v_version_id;

    update public.site_pages
    set current_draft_version_id = v_version_id
    where id = v_blog_page_id;

    update public.sites
    set home_page_id = v_blog_page_id
    where id = v_site_id;

    update public.posts
    set site_id = v_site_id,
        blog_page_id = v_blog_page_id
    where workspace_id = p_workspace_id
      and site_id is null;

    return v_site_id;
end;
$$;

revoke all on function public.provision_default_site(uuid, uuid) from public;
grant execute on function public.provision_default_site(uuid, uuid) to authenticated;

-- Backfill existing workspaces
do $$
declare
    r record;
    v_owner uuid;
begin
    for r in select id from public.workspaces loop
        select owner_id into v_owner from public.workspaces where id = r.id;
        if v_owner is not null then
            perform public.provision_default_site(r.id, v_owner);
        end if;
    end loop;
end;
$$;

-- triggers
create or replace function public.set_sites_updated_at()
returns trigger language plpgsql as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists sites_updated_at on public.sites;
create trigger sites_updated_at
    before update on public.sites
    for each row execute function public.set_sites_updated_at();

create or replace function public.set_site_pages_updated_at()
returns trigger language plpgsql as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists site_pages_updated_at on public.site_pages;
create trigger site_pages_updated_at
    before update on public.site_pages
    for each row execute function public.set_site_pages_updated_at();

create or replace function public.set_site_layouts_updated_at()
returns trigger language plpgsql as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists site_layouts_updated_at on public.site_layouts;
create trigger site_layouts_updated_at
    before update on public.site_layouts
    for each row execute function public.set_site_layouts_updated_at();

-- unique post slug per site (keep workspace unique for transition)
create unique index posts_site_slug_unique
    on public.posts (site_id, slug)
    where site_id is not null;
