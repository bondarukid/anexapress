-- Post preview header fields: description, author, SEO sync flag.

alter table public.posts
    add column if not exists description text,
    add column if not exists author_name text,
    add column if not exists author_avatar_id uuid references public.media_files (id) on delete set null,
    add column if not exists use_post_description_for_seo boolean not null default false;

create index if not exists posts_author_avatar_id_idx on public.posts (author_avatar_id);
