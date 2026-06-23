-- CMS: posts, versions, blocks, media library, storage bucket.

-- ---------------------------------------------------------------------------
-- media_files (before posts.og_image_id FK)
-- ---------------------------------------------------------------------------

create table public.media_files (
    id uuid primary key default gen_random_uuid(),
    workspace_id uuid not null references public.workspaces (id) on delete cascade,
    storage_path text not null,
    bucket text not null default 'workspace-media',
    filename text not null,
    mime_type text not null,
    size bigint not null,
    width int,
    height int,
    alt text,
    title text,
    public_url text not null,
    created_by uuid not null references auth.users (id),
    created_at timestamptz not null default now(),
    constraint media_files_workspace_path_unique unique (workspace_id, storage_path)
);

create index media_files_workspace_id_idx on public.media_files (workspace_id);
create index media_files_created_at_idx on public.media_files (workspace_id, created_at desc);

-- ---------------------------------------------------------------------------
-- posts
-- ---------------------------------------------------------------------------

create table public.posts (
    id uuid primary key default gen_random_uuid(),
    workspace_id uuid not null references public.workspaces (id) on delete cascade,
    slug text not null,
    title text not null,
    status text not null default 'draft'
        check (status in ('draft', 'published', 'archived')),
    published_at timestamptz,
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
    constraint posts_workspace_slug_unique unique (workspace_id, slug)
);

create index posts_workspace_id_idx on public.posts (workspace_id);
create index posts_workspace_status_idx on public.posts (workspace_id, status);
create index posts_published_at_idx on public.posts (workspace_id, published_at desc nulls last);

-- ---------------------------------------------------------------------------
-- post_versions
-- ---------------------------------------------------------------------------

create table public.post_versions (
    id uuid primary key default gen_random_uuid(),
    post_id uuid not null references public.posts (id) on delete cascade,
    version int not null default 0,
    kind text not null check (kind in ('draft', 'snapshot', 'published')),
    is_current boolean not null default false,
    content jsonb not null default '{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb,
    title text not null,
    seo_snapshot jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    created_by uuid not null references auth.users (id),
    constraint post_versions_post_version_unique unique (post_id, version, kind)
);

create unique index post_versions_one_draft_per_post
    on public.post_versions (post_id)
    where kind = 'draft';

create index post_versions_post_id_idx on public.post_versions (post_id, created_at desc);

-- FK from posts to versions (deferred until versions exist)
alter table public.posts
    add constraint posts_current_draft_version_id_fkey
        foreign key (current_draft_version_id) references public.post_versions (id) on delete set null;

alter table public.posts
    add constraint posts_published_version_id_fkey
        foreign key (published_version_id) references public.post_versions (id) on delete set null;

-- ---------------------------------------------------------------------------
-- post_blocks
-- ---------------------------------------------------------------------------

create table public.post_blocks (
    id uuid primary key default gen_random_uuid(),
    post_id uuid not null references public.posts (id) on delete cascade,
    version_id uuid not null references public.post_versions (id) on delete cascade,
    parent_id uuid references public.post_blocks (id) on delete cascade,
    sort_order int not null default 0,
    type text not null,
    attrs jsonb not null default '{}'::jsonb,
    content jsonb not null default '[]'::jsonb,
    created_at timestamptz not null default now()
);

create index post_blocks_version_id_idx on public.post_blocks (version_id, sort_order);
create index post_blocks_post_id_idx on public.post_blocks (post_id);
create index post_blocks_type_idx on public.post_blocks (version_id, type);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.media_files enable row level security;
alter table public.posts enable row level security;
alter table public.post_versions enable row level security;
alter table public.post_blocks enable row level security;

-- media_files
create policy "media_files_select_member"
    on public.media_files for select
    to authenticated
    using (public.can_view_workspace(workspace_id));

create policy "media_files_insert_content_create"
    on public.media_files for insert
    to authenticated
    with check (
        public.has_effective_workspace_permission(workspace_id, 'content.create')
    );

create policy "media_files_update_content_create"
    on public.media_files for update
    to authenticated
    using (
        public.has_effective_workspace_permission(workspace_id, 'content.create')
    )
    with check (
        public.has_effective_workspace_permission(workspace_id, 'content.create')
    );

create policy "media_files_delete_content_create"
    on public.media_files for delete
    to authenticated
    using (
        public.has_effective_workspace_permission(workspace_id, 'content.create')
    );

-- posts: members see all; public sees published
create policy "posts_select_member"
    on public.posts for select
    to authenticated
    using (public.can_view_workspace(workspace_id));

create policy "posts_select_public_published"
    on public.posts for select
    to anon, authenticated
    using (
        status = 'published'
        and public.can_view_workspace(workspace_id)
    );

create policy "posts_insert_content_create"
    on public.posts for insert
    to authenticated
    with check (
        public.has_effective_workspace_permission(workspace_id, 'content.create')
    );

create policy "posts_update_content_create"
    on public.posts for update
    to authenticated
    using (
        public.has_effective_workspace_permission(workspace_id, 'content.create')
    )
    with check (
        public.has_effective_workspace_permission(workspace_id, 'content.create')
    );

create policy "posts_delete_content_create"
    on public.posts for delete
    to authenticated
    using (
        public.has_effective_workspace_permission(workspace_id, 'content.create')
    );

-- post_versions
create policy "post_versions_select_member"
    on public.post_versions for select
    to authenticated
    using (
        exists (
            select 1 from public.posts p
            where p.id = post_versions.post_id
              and public.can_view_workspace(p.workspace_id)
        )
    );

create policy "post_versions_select_public_published"
    on public.post_versions for select
    to anon, authenticated
    using (
        exists (
            select 1 from public.posts p
            where p.id = post_versions.post_id
              and p.status = 'published'
              and p.published_version_id = post_versions.id
              and public.can_view_workspace(p.workspace_id)
        )
    );

create policy "post_versions_insert_content_create"
    on public.post_versions for insert
    to authenticated
    with check (
        exists (
            select 1 from public.posts p
            where p.id = post_versions.post_id
              and public.has_effective_workspace_permission(p.workspace_id, 'content.create')
        )
    );

create policy "post_versions_update_content_create"
    on public.post_versions for update
    to authenticated
    using (
        exists (
            select 1 from public.posts p
            where p.id = post_versions.post_id
              and public.has_effective_workspace_permission(p.workspace_id, 'content.create')
        )
    )
    with check (
        exists (
            select 1 from public.posts p
            where p.id = post_versions.post_id
              and public.has_effective_workspace_permission(p.workspace_id, 'content.create')
        )
    );

create policy "post_versions_delete_content_create"
    on public.post_versions for delete
    to authenticated
    using (
        exists (
            select 1 from public.posts p
            where p.id = post_versions.post_id
              and public.has_effective_workspace_permission(p.workspace_id, 'content.create')
        )
    );

-- post_blocks
create policy "post_blocks_select_member"
    on public.post_blocks for select
    to authenticated
    using (
        exists (
            select 1 from public.posts p
            where p.id = post_blocks.post_id
              and public.can_view_workspace(p.workspace_id)
        )
    );

create policy "post_blocks_select_public_published"
    on public.post_blocks for select
    to anon, authenticated
    using (
        exists (
            select 1 from public.posts p
            where p.id = post_blocks.post_id
              and p.status = 'published'
              and p.published_version_id = post_blocks.version_id
              and public.can_view_workspace(p.workspace_id)
        )
    );

create policy "post_blocks_insert_content_create"
    on public.post_blocks for insert
    to authenticated
    with check (
        exists (
            select 1 from public.posts p
            where p.id = post_blocks.post_id
              and public.has_effective_workspace_permission(p.workspace_id, 'content.create')
        )
    );

create policy "post_blocks_update_content_create"
    on public.post_blocks for update
    to authenticated
    using (
        exists (
            select 1 from public.posts p
            where p.id = post_blocks.post_id
              and public.has_effective_workspace_permission(p.workspace_id, 'content.create')
        )
    );

create policy "post_blocks_delete_content_create"
    on public.post_blocks for delete
    to authenticated
    using (
        exists (
            select 1 from public.posts p
            where p.id = post_blocks.post_id
              and public.has_effective_workspace_permission(p.workspace_id, 'content.create')
        )
    );

-- ---------------------------------------------------------------------------
-- Storage bucket: workspace-media
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'workspace-media',
    'workspace-media',
    true,
    10485760,
    array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml']::text[]
)
on conflict (id) do update
set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "workspace_media_public_read" on storage.objects;
create policy "workspace_media_public_read"
    on storage.objects for select
    to public
    using (bucket_id = 'workspace-media');

drop policy if exists "workspace_media_content_insert" on storage.objects;
create policy "workspace_media_content_insert"
    on storage.objects for insert
    to authenticated
    with check (
        bucket_id = 'workspace-media'
        and auth.uid() is not null
        and public.has_effective_workspace_permission(
            ((storage.foldername(name))[1])::uuid,
            'content.create'
        )
    );

drop policy if exists "workspace_media_content_update" on storage.objects;
create policy "workspace_media_content_update"
    on storage.objects for update
    to authenticated
    using (
        bucket_id = 'workspace-media'
        and auth.uid() is not null
        and public.has_effective_workspace_permission(
            ((storage.foldername(name))[1])::uuid,
            'content.create'
        )
    );

drop policy if exists "workspace_media_content_delete" on storage.objects;
create policy "workspace_media_content_delete"
    on storage.objects for delete
    to authenticated
    using (
        bucket_id = 'workspace-media'
        and auth.uid() is not null
        and public.has_effective_workspace_permission(
            ((storage.foldername(name))[1])::uuid,
            'content.create'
        )
    );

-- ---------------------------------------------------------------------------
-- RPC: create_post_with_draft
-- ---------------------------------------------------------------------------

create or replace function public.create_post_with_draft(
    p_workspace_id uuid,
    p_title text,
    p_slug text,
    p_user_id uuid default auth.uid()
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_post_id uuid;
    v_version_id uuid;
    v_empty_doc jsonb := '{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb;
begin
    if p_user_id is null then
        raise exception 'Not authenticated';
    end if;

    if not public.has_effective_workspace_permission(p_workspace_id, 'content.create') then
        raise exception 'Permission denied';
    end if;

    insert into public.posts (
        workspace_id,
        slug,
        title,
        status,
        created_by,
        updated_by
    )
    values (
        p_workspace_id,
        p_slug,
        p_title,
        'draft',
        p_user_id,
        p_user_id
    )
    returning id into v_post_id;

    insert into public.post_versions (
        post_id,
        version,
        kind,
        is_current,
        content,
        title,
        seo_snapshot,
        created_by
    )
    values (
        v_post_id,
        0,
        'draft',
        true,
        v_empty_doc,
        p_title,
        '{}'::jsonb,
        p_user_id
    )
    returning id into v_version_id;

    update public.posts
    set current_draft_version_id = v_version_id,
        updated_at = now()
    where id = v_post_id;

    return v_post_id;
end;
$$;

revoke all on function public.create_post_with_draft(uuid, text, text, uuid) from public;
grant execute on function public.create_post_with_draft(uuid, text, text, uuid) to authenticated;

-- updated_at trigger for posts
create or replace function public.set_posts_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists posts_updated_at on public.posts;
create trigger posts_updated_at
    before update on public.posts
    for each row
    execute function public.set_posts_updated_at();
