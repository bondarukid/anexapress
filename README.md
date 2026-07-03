



[Node](https://nodejs.org/)
[Next.js](https://nextjs.org/)
[TypeScript](https://www.typescriptlang.org/)
[Supabase](https://supabase.com/)
[Issues](https://github.com/bondarukid/anexapress/issues)
[License](#license)

  






# AnexaPress CMS

### Multi-tenant content platform for teams

Sites, pages, blog, block editor, media library, versioning, and custom domains — from one workspace.

**[Explore the docs](https://github.com/bondarukid/anexapress/tree/main/content/docs)** · **[Report Bug](https://github.com/bondarukid/anexapress/issues)** · **[Request Feature](https://github.com/bondarukid/anexapress/issues)**



  




**Table of Contents**

1. [About The Project](#about-the-project)
  - [Built With](#built-with)
  - [Key Features](#key-features)
2. [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
3. [Usage](#usage)
4. [Roadmap](#roadmap)
5. [Contributing](#contributing)
6. [License](#license)
7. [Contact](#contact)
8. [Acknowledgments](#acknowledgments)

  




## About The Project

AnexaPress is a **content management engine** for teams that outgrow a single blog. Each workspace gets isolated data, roles, and permissions; inside it you run one or many **public sites** with pages, posts, SEO, and optional **custom domains**.

The dashboard ships a **Notion-style block editor** (Tiptap / Novel): draft autosave, manual snapshots, publish pipeline, and server-rendered public pages for visitors.

Why this project exists:

- **Real multi-tenancy** — workspaces, sites, RLS, and permissions wired end to end, not bolted on later
- **Editor-first CMS** — slash menu, drag-and-drop blocks, media picker, version history
- **Production-shaped codebase** — Next.js App Router, Server Actions, Zod, services layer, typed Supabase
- **Learn by building** — a solid reference if you want to see how a modern SaaS CMS is structured

([back to top](#readme-top))

### Built With

- [Next](https://nextjs.org/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Supabase](https://supabase.com/)
- [Tiptap](https://tiptap.dev/) / [Novel](https://novel.sh/)
- [Zod](https://zod.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Fumadocs](https://fumadocs.dev/) — in-app documentation

([back to top](#readme-top))

### Key Features


| Area            | Highlights                                                                        |
| --------------- | --------------------------------------------------------------------------------- |
| **Workspaces**  | Team isolation, invites, roles, optional parent/child hierarchy                   |
| **Sites**       | Multiple sites per workspace, layout builder, default SEO, domain mapping         |
| **Content**     | Pages + blog posts, draft → publish, snapshots, revert                            |
| **Editor**      | Rich blocks, YouTube embeds, image upload, slash commands                         |
| **Media**       | Workspace library, picker in editor, Supabase Storage                             |
| **Public site** | SSR pages & blog, typography pipeline, author avatars, OG metadata                |
| **Domains**     | Custom domain routing, `robots.txt` / verification files, search-engine meta tags |


Feature flags: `ENABLE_MULTI_SITE`, `ENABLE_MULTI_WORKSPACE` — see `[lib/config/feature-flags.ts](lib/config/feature-flags.ts)`.

([back to top](#readme-top))



## Getting Started

Run AnexaPress locally in a few minutes.

### Prerequisites

- **Node.js** ≥ 22.13 — [nodejs.org](https://nodejs.org/)
- **npm** (ships with Node)
- **Supabase** project — [supabase.com](https://supabase.com/) or local CLI

### Installation

1. Clone the repository
  ```bash
   git clone https://github.com/bondarukid/anexapress.git
   cd anexapress
  ```
2. Install dependencies
  ```bash
   npm install
  ```
3. Configure environment
  ```bash
   cp .env.example .env.local
  ```
   Minimum variables:
4. Link Supabase and apply migrations
  ```bash
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
  ```
5. Start the development server
  ```bash
   npm run dev
  ```
   Open [http://localhost:3000](http://localhost:3000).

([back to top](#readme-top))



## Usage

**First publish flow:**

1. Sign up → complete onboarding → workspace is created
2. Dashboard → **Sites** → open default site (`main`)
3. **Pages** or **Content** → create a page or post
4. Write in the block editor → **Publish**
5. Open `http://localhost:3000/{workspaceSlug}/main` — public site
6. Optional: **Site settings** → add a custom domain and SEO defaults

**Useful paths:**


| Path                                | Purpose                          |
| ----------------------------------- | -------------------------------- |
| `/{workspaceSlug}/dashboard`        | Team dashboard                   |
| `/{workspaceSlug}/editor/post/{id}` | Fullscreen post editor           |
| `/{workspaceSlug}/{siteSlug}`       | Public site home                 |
| `/{workspaceSlug}/{siteSlug}/blog`  | Public blog index                |
| `/docs`                             | Product documentation (Fumadocs) |


**Scripts:**


| Command          | Description            |
| ---------------- | ---------------------- |
| `npm run dev`    | Development server     |
| `npm run build`  | MDX + production build |
| `npm run start`  | Serve production build |
| `npm run lint`   | ESLint                 |
| `npm run format` | Prettier               |


([back to top](#readme-top))



## Roadmap

- [x] Multi-tenant workspaces & sites
- [x] Block editor with versioning and publish pipeline
- [x] Blog index and public post pages
- [x] Media library and site file manager
- [x] Custom domains and search-engine verification
- [ ] Post cover image override in settings
- [ ] Expanded block types and layout sections
- [ ] **Plugin system** — extend the CMS with installable plugins (editor, publishing, integrations)
- [ ] **Component templates** — create custom blocks/sections, export and share them with other workspaces or the community
- [ ] **Social publishing** — connect social accounts and auto-post when you publish an article (title, link, preview)
- [ ] Public API / webhooks
- [ ] E2E test suite

See [open issues](https://github.com/bondarukid/anexapress/issues) for the full backlog.

([back to top](#readme-top))



## Contributing

**AnexaPress is looking for contributors** who want to help shape the project.

I believe **open source is a good practice** — especially for people who want to **learn something new**, see how a real multi-tenant CMS is built, and **make a meaningful contribution**. Whether you care about Next.js, Supabase, editor tooling, design systems, or product UX — there is room to grow here and leave your mark.

Contributions are what make the open source community great. Any contribution you make is **greatly appreciated**.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Before larger changes:** open an issue first so we can align on scope.

**Read before you code:** [components/cms/README.md](components/cms/README.md) — CMS UI map and conventions. Code is split into `types/`, `schemas/`, `services/`, `actions/`, and `lib/` layers.

([back to top](#readme-top))



## License

Private — all rights reserved.

([back to top](#readme-top))



## Contact

**Ivan Bondaruk** — [@bondarukid](https://github.com/bondarukid)

**Project:** [https://github.com/bondarukid/anexapress](https://github.com/bondarukid/anexapress)

([back to top](#readme-top))



## Acknowledgments

- [Next.js](https://nextjs.org/) — App Router & React framework
- [Supabase](https://supabase.com/) — Postgres, Auth, Storage
- [Tiptap](https://tiptap.dev/) — headless editor toolkit
- [shadcn/ui](https://ui.shadcn.com/) — accessible UI primitives
- [shields.io](https://shields.io/) — README badges

([back to top](#readme-top))

---



**[⬆ Back to top](#readme-top)**

  


Built with Next.js, Supabase, and Tiptap





