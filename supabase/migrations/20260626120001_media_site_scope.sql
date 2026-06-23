-- Optional site scope for media library

alter table public.media_files
    add column if not exists site_id uuid references public.sites (id) on delete set null;

create index if not exists media_files_site_id_idx on public.media_files (site_id);
