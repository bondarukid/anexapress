-- Site root files (app-ads.txt, robots.txt, .well-known/*)

create table public.site_files (
    id uuid primary key default gen_random_uuid(),
    workspace_id uuid not null references public.workspaces (id) on delete cascade,
    site_id uuid not null references public.sites (id) on delete cascade,
    bucket text not null default 'site-files',
    storage_path text not null,
    public_path text not null,
    filename text not null,
    mime_type text not null,
    size bigint not null,
    created_by uuid not null references auth.users (id),
    created_at timestamptz not null default now(),
    constraint site_files_site_public_path_unique unique (site_id, public_path),
    constraint site_files_site_storage_path_unique unique (site_id, storage_path)
);

create index site_files_site_id_idx on public.site_files (site_id);
create index site_files_workspace_id_idx on public.site_files (workspace_id);

alter table public.site_files enable row level security;

create policy "site_files_select_member"
    on public.site_files for select
    to authenticated
    using (public.can_view_workspace(workspace_id));

create policy "site_files_select_public"
    on public.site_files for select
    to anon, authenticated
    using (public.can_view_workspace(workspace_id));

create policy "site_files_insert_content_create"
    on public.site_files for insert
    to authenticated
    with check (
        public.has_effective_workspace_permission(workspace_id, 'content.create')
    );

create policy "site_files_update_content_create"
    on public.site_files for update
    to authenticated
    using (
        public.has_effective_workspace_permission(workspace_id, 'content.create')
    );

create policy "site_files_delete_content_create"
    on public.site_files for delete
    to authenticated
    using (
        public.has_effective_workspace_permission(workspace_id, 'content.create')
    );

-- Storage bucket: site-files (public read, content.create write via site_id folder)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'site-files',
    'site-files',
    true,
    1048576,
    array[
        'text/plain',
        'text/html',
        'application/json',
        'application/xml',
        'text/xml',
        'application/octet-stream'
    ]
)
on conflict (id) do nothing;

create policy "site_files_storage_select_public"
    on storage.objects for select
    to public
    using (bucket_id = 'site-files');

create policy "site_files_storage_insert_content_create"
    on storage.objects for insert
    to authenticated
    with check (
        bucket_id = 'site-files'
        and exists (
            select 1
            from public.sites s
            where s.id::text = (storage.foldername(name))[1]
              and public.has_effective_workspace_permission(s.workspace_id, 'content.create')
        )
    );

create policy "site_files_storage_update_content_create"
    on storage.objects for update
    to authenticated
    using (
        bucket_id = 'site-files'
        and exists (
            select 1
            from public.sites s
            where s.id::text = (storage.foldername(name))[1]
              and public.has_effective_workspace_permission(s.workspace_id, 'content.create')
        )
    );

create policy "site_files_storage_delete_content_create"
    on storage.objects for delete
    to authenticated
    using (
        bucket_id = 'site-files'
        and exists (
            select 1
            from public.sites s
            where s.id::text = (storage.foldername(name))[1]
              and public.has_effective_workspace_permission(s.workspace_id, 'content.create')
        )
    );
