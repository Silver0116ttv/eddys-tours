# Eddy's Tours

Responsive tour marketplace for Puerto Vallarta, built with Next.js, React, TypeScript,
Tailwind CSS, and a Supabase-ready backend.

## Requirements

- Node.js 24
- pnpm 11.19.0

Node 24 ships with Corepack, which installs the pnpm version pinned in
`package.json`. If your shell does not recognize `pnpm`, enable it once and reopen the
terminal:

```bash
corepack enable pnpm
```

## Local development

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://localhost:3000`.

Copy `.env.example` to `.env.local`. The storefront continues to use the bundled catalog
until both public Supabase values are present.

## Supabase backend

The versioned backend is in `supabase/` and includes:

- customers, operators, and administrator roles
- tours, media, public prices, departures, and inventory holds
- bookings, booking items, payments, verified reviews, and favorites
- private provider costs and audit logs
- Row Level Security policies for every table exposed through the Data API

Local Supabase requires Docker Desktop. Once Docker is running:

```bash
pnpm supabase:start
pnpm supabase:reset
```

Copy the local API URL and publishable key printed by Supabase into `.env.local`, then
restart `pnpm dev`. Regenerate TypeScript types after schema changes with:

```bash
pnpm supabase:types
```

To connect a new hosted project, authenticate and link it first, review the target, and
then push the versioned migration:

```bash
pnpm dlx supabase login
pnpm dlx supabase link --project-ref YOUR_PROJECT_REF
pnpm dlx supabase db push
```

The seed file contains the current eight-tour demo catalog and sample departures. Apply it
only after reviewing the dates and replacing them with real operator availability. Add the
two public Supabase variables to Vercel after the hosted database is ready. The service-role
key must remain server-only and is not required for public catalog reads.

## Quality checks

```bash
pnpm lint
pnpm typecheck
pnpm build
```

Run all checks with:

```bash
pnpm check
```

## Images

Source PNG files in `public/images` are kept locally and ignored by Git. Generate the deployable WebP assets with:

```bash
pnpm optimize:images
```

Generated UI components are committed to the repository, so the `shadcn` CLI is not a runtime dependency. Use `pnpm dlx shadcn@latest` only when adding or updating generated components.
