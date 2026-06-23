-- Public website URL for workspace branding settings.
alter table public.workspaces
    add column if not exists website_url text null;

comment on column public.workspaces.website_url is
    'Public website URL displayed in workspace branding settings.';
