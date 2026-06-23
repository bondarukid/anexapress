-- Public bucket for user profile avatars (account settings + onboarding).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'avatars',
    'avatars',
    true,
    2097152,
    array['image/png', 'image/jpeg', 'image/webp']::text[]
)
on conflict (id) do update
set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
    on storage.objects for select
    to public
    using (bucket_id = 'avatars');

drop policy if exists "avatars_owner_insert" on storage.objects;
create policy "avatars_owner_insert"
    on storage.objects for insert
    to authenticated
    with check (
        bucket_id = 'avatars'
        and auth.uid() is not null
        and auth.uid()::text = (storage.foldername(name))[1]
    );

drop policy if exists "avatars_owner_update" on storage.objects;
create policy "avatars_owner_update"
    on storage.objects for update
    to authenticated
    using (
        bucket_id = 'avatars'
        and auth.uid() is not null
        and auth.uid()::text = (storage.foldername(name))[1]
    );

drop policy if exists "avatars_owner_delete" on storage.objects;
create policy "avatars_owner_delete"
    on storage.objects for delete
    to authenticated
    using (
        bucket_id = 'avatars'
        and auth.uid() is not null
        and auth.uid()::text = (storage.foldername(name))[1]
    );
