-- Cleanup auto-created duplicate personal workspaces (ensurePersonalWorkspace spam).
--
-- Run in Supabase SQL Editor. Replace :user_id with your auth.users id.
--
-- Step 1: Inspect owned root workspaces (newest last)
-- select w.id, w.name, w.slug, w.created_at
-- from public.workspaces w
-- where w.owner_id = :'user_id'
--   and w.parent_workspace_id is null
-- order by w.created_at asc;

-- Step 2: Preview rows that would be deleted (keeps the oldest owned root per user)
with owned_roots as (
    select
        w.id,
        w.owner_id,
        w.name,
        w.slug,
        w.created_at,
        row_number() over (
            partition by w.owner_id
            order by w.created_at asc
        ) as rn
    from public.workspaces w
    where w.owner_id = :'user_id'
      and w.parent_workspace_id is null
)
select id, name, slug, created_at
from owned_roots
where rn > 1
order by created_at;

-- Step 3: Delete duplicates (uncomment after preview looks correct)
-- with owned_roots as (
--     select
--         w.id,
--         row_number() over (
--             partition by w.owner_id
--             order by w.created_at asc
--         ) as rn
--     from public.workspaces w
--     where w.owner_id = :'user_id'
--       and w.parent_workspace_id is null
-- )
-- delete from public.workspaces w
-- using owned_roots o
-- where w.id = o.id
--   and o.rn > 1;
