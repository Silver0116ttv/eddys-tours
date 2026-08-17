# Eddy's Tours

Responsive tour marketplace prototype for Puerto Vallarta, built with Next.js, React, TypeScript, and Tailwind CSS.

## Requirements

- Node.js 24
- pnpm 11.19.0

On Windows, if PowerShell does not recognize `pnpm`, install it with npm and then reopen the terminal:

```powershell
npx get-pnpm
```

## Local development

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://localhost:3000`.

The current static prototype does not require environment variables. Copy `.env.example` to `.env.local` when Supabase or Stripe is integrated.

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
