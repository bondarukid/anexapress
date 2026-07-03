-- Search engine verification meta tags (Google, Bing, etc.) injected into public site <head>.
alter table public.sites
  add column if not exists verification_meta_tags jsonb not null default '[]';

comment on column public.sites.verification_meta_tags is
  'Array of {provider, name, content} objects for <meta name="..." content="..."> site verification.';
