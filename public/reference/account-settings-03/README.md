# Account Settings 03 — reference

Manual port from [Shadcn Studio Account Settings 03](https://shadcnstudio.com/blocks/dashboard-and-application/account-settings#account-settings-03).

Registry install (`npx shadcn add @ss-blocks/account-settings-03`) requires a paid license (401).

## Sections (block spec)

1. **Workspace** — name + public URL
2. **Timezone** — default workspace timezone select
3. **Branding** — logo upload + brand identity fields
4. **Organization connections** — external org connect cards
5. **Data export** — export workspace data CTA
6. **Danger zone** — leave, transfer ownership, delete workspace

## Layout

- `lg:grid-cols-3` section shell (title/description | `lg:col-span-2` content)
- `Separator` between sections
- `Card` + `CardContent` for form rows and danger actions
