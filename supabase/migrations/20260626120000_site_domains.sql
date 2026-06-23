-- Custom domains for workspace sites

create table public.site_domains (
    id uuid primary key default gen_random_uuid(),
    site_id uuid not null references public.sites (id) on delete cascade,
    domain text not null,
    is_primary boolean not null default false,
    created_at timestamptz not null default now(),
    constraint site_domains_domain_unique unique (domain)
);

create unique index site_domains_one_primary_per_site
    on public.site_domains (site_id)
    where is_primary = true;

create index site_domains_domain_lower_idx on public.site_domains (lower(domain));
create index site_domains_site_id_idx on public.site_domains (site_id);

alter table public.site_domains enable row level security;

-- Members can manage domains for their workspace sites
create policy "site_domains_select_member"
    on public.site_domains for select
    to authenticated
    using (
        exists (
            select 1
            from public.sites s
            where s.id = site_domains.site_id
              and public.can_view_workspace(s.workspace_id)
        )
    );

create policy "site_domains_insert_content_create"
    on public.site_domains for insert
    to authenticated
    with check (
        exists (
            select 1
            from public.sites s
            where s.id = site_domains.site_id
              and public.has_effective_workspace_permission(s.workspace_id, 'content.create')
        )
    );

create policy "site_domains_update_content_create"
    on public.site_domains for update
    to authenticated
    using (
        exists (
            select 1
            from public.sites s
            where s.id = site_domains.site_id
              and public.has_effective_workspace_permission(s.workspace_id, 'content.create')
        )
    );

create policy "site_domains_delete_content_create"
    on public.site_domains for delete
    to authenticated
    using (
        exists (
            select 1
            from public.sites s
            where s.id = site_domains.site_id
              and public.has_effective_workspace_permission(s.workspace_id, 'content.create')
        )
    );

-- Public read for domain resolution in proxy (anon)
create policy "site_domains_select_public_resolve"
    on public.site_domains for select
    to anon, authenticated
    using (
        exists (
            select 1
            from public.sites s
            where s.id = site_domains.site_id
              and public.can_view_workspace(s.workspace_id)
        )
    );

-- Sync sites.primary_domain when primary domain changes
create or replace function public.sync_site_primary_domain()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    if tg_op = 'INSERT' or tg_op = 'UPDATE' then
        if new.is_primary then
            update public.sites
            set primary_domain = new.domain
            where id = new.site_id;
            update public.site_domains
            set is_primary = false
            where site_id = new.site_id
              and id <> new.id
              and is_primary = true;
        end if;
        return new;
    elsif tg_op = 'DELETE' then
        if old.is_primary then
            update public.sites
            set primary_domain = (
                select sd.domain
                from public.site_domains sd
                where sd.site_id = old.site_id
                order by sd.created_at asc
                limit 1
            )
            where id = old.site_id;
        end if;
        return old;
    end if;
    return null;
end;
$$;

create trigger site_domains_sync_primary
    after insert or update or delete on public.site_domains
    for each row
    execute function public.sync_site_primary_domain();
