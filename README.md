# AnexaPress CMS

**Multi-tenant CMS** for teams: multiple sites per workspace, block editor, blog, media library, content versioning, and public delivery on your own domain.

**Stack:** Next.js 16 · React 19 · TypeScript · Supabase · Tiptap/Novel · Zod · Tailwind · shadcn/ui

---

## Overview

A **content management engine** with multi-tenancy: each team (workspace) runs its sites, pages, and blog from one panel.

- **Workspace** — data isolation, roles, invitations
- **Site** — public site: slug, layout, domains
- **Pages & Posts** — pages and blog, draft → publish, version history
- **Media & Files** — images in Storage and downloadable files

---

## Quick start

```bash
git clone <repository-url> && cd anexapress
npm install
cp .env.example .env.local
# SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
npx supabase link --project-ref <ref> && npx supabase db push
npm run dev
```

1. Sign up → onboarding → workspace
2. **Sites** → default site (`main`)
3. **Pages** → create a page → **Publish**
4. Open `/{workspaceSlug}/main` — public content

Flags: `ENABLE_MULTI_SITE`, `ENABLE_MULTI_WORKSPACE` — see `lib/config/feature-flags.ts`.

---

## CMS migrations


| File                                  | Contents                       |
| ------------------------------------- | ------------------------------ |
| `20260624120000_cms_posts.sql`        | posts, versions, blocks, media |
| `20260625120000_workspace_sites.sql`  | sites, pages, layouts          |
| `20260626120000_site_domains.sql`     | domains                        |
| `20260626120001_media_site_scope.sql` | media ↔ site                   |
| `20260626120002_site_files.sql`       | file manager                   |


---

## Scripts


| Command                   | Purpose                |
| ------------------------- | ---------------------- |
| `npm run dev`             | dev server             |
| `npm run build`           | MDX + production build |
| `npm run lint` / `format` | code quality           |


---

## License

Private — all rights reserved.