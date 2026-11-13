# SaaS Boilerplate — hardened fork

A free and open-source SaaS starter kit built with **Next.js 16, React 19, TypeScript, Tailwind CSS 4, Shadcn UI, Clerk, Drizzle ORM and next-intl**.

This is a hardened fork of [ixartz/SaaS-Boilerplate](https://github.com/ixartz/SaaS-Boilerplate) with the following improvements over upstream:

- **Unified auth architecture**: `ClerkProvider` lives in the root layout and the Clerk middleware runs for every request, so public pages can render signed-in state too.
- **Server-side authorization helpers**: `requireSession()` / `requireOrg()` in `src/libs/Authz.ts` — call them at the top of every Server Component, Server Action and Route Handler. The middleware is not an authorization boundary for your data.
- **Multi-tenant data model**: the Drizzle schema demonstrates the tenant-isolation pattern (`orgId` tenant key, UUID primary keys, tenant-scoped indexes and unique constraints).
- **Build/migration decoupling**: `npm run build` no longer runs migrations. Apply them explicitly with `npm run db:migrate:deploy` during your release phase.
- **Security baseline**: security headers (CSP, HSTS, X-Frame-Options, …) in `next.config.ts`; Sentry defaults changed to privacy-preserving values (`sendDefaultPii: false`, 10% trace sampling); Postgres pool tuning with TLS detection.
- **i18n fixes**: locale-aware redirects for organization onboarding and sign-in; multi-locale `robots.txt` rules.
- **SEO baseline**: `metadataBase`, Open Graph, Twitter cards and `hreflang` alternates from the root layout; `VERCEL_URL` fallback so `localhost` never leaks into canonical URLs.
- **App Router skeleton**: `loading.tsx`, `error.tsx` (with Sentry capture + retry) and a localized `not-found.tsx`.
- **Honest CI**: Codecov / Chromatic / Crowdin / Checkly steps are skipped gracefully when their secrets are not configured, so forks stay green.
- **No promotional content**: demo badges, sponsor logos and upsell pages from upstream have been removed.

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router) · React 19 · TypeScript 6 · Node.js ≥ 24 |
| UI | Tailwind CSS 4 · Radix UI · shadcn/ui |
| Auth | Clerk (organizations = tenants) |
| Database | Drizzle ORM · PostgreSQL (local dev with PGlite, no Docker) |
| i18n | next-intl · Crowdin (optional) |
| Env validation | T3 Env + Zod |
| Observability | Sentry · LogTape (+ Better Stack, optional) |
| Tests | Vitest (browser mode) · Playwright · Storybook |
| Quality | ESLint (antfu) · lefthook · commitlint · semantic-release · knip |

## Getting started

Requirements: Node.js 24+ and npm.

```shell
git clone <your-repo> my-project-name
cd my-project-name
npm install
npm run dev
```

`npm run dev` starts Next.js, a local PostgreSQL-compatible PGlite database (migrations applied automatically) and Sentry Spotlight. Open http://localhost:3000.

## Set up authentication

1. Create a Clerk application at [clerk.com](https://clerk.com) and copy `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` into `.env.local`.
2. In the Clerk dashboard, enable organizations: **Organization management → Settings → Enable organization**.

## Architecture notes

### Authentication and tenancy

- `src/proxy.ts` (middleware) protects `/dashboard` and `/onboarding` for every locale and redirects organization-less users to onboarding.
- `src/libs/Authz.ts` is the real authorization boundary for data access:

```ts
import { requireOrg } from '@/libs/Authz';

export async function myServerAction() {
  'use server';
  const { userId, orgId } = await requireOrg();
  // scope every query: .where(eq(todoSchema.orgId, orgId))
}
```

### Database

- Define tables in `src/models/Schema.ts`. Every tenant-owned table gets an `orgId` column and an index.
- `npm run db:generate` — generate a migration after schema changes.
- `npm run db:migrate` — apply migrations locally.
- `npm run db:migrate:deploy` — apply migrations in production (release phase), the build does **not** migrate.
- `npm run db:studio` — explore the database with Drizzle Studio.

### Deployment

1. Set `DATABASE_URL`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `NEXT_PUBLIC_APP_URL` in your hosting environment.
2. `npm run build` then `npm start` (or deploy to Vercel).
3. Run `npm run db:migrate:deploy` once during the release phase, before the new version takes traffic.

Optional integrations (each one activates only if its secrets are present): Sentry (error monitoring), Better Stack (log management), Codecov (coverage), Chromatic (visual regression), Crowdin (translations), Checkly (uptime monitoring). See the comments inside `.env.production`.

## Testing

```shell
npm run test        # unit + component tests (Vitest)
npm run test:e2e    # E2E tests (Playwright)
npm run storybook   # component workshop
```

All unit tests live next to the source code. E2E tests live in `tests/e2e`.

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run lint` / `lint:fix` | ESLint |
| `npm run check:types` | TypeScript |
| `npm run check:deps` | knip (unused code/dependencies) |
| `npm run check:i18n` | locale key completeness |
| `npm run build-stats` | bundle analyzer |

## Customization checklist

Search the codebase for `FIXME:` to find every customization point:

- `src/utils/AppConfig.ts` — app name, tagline, description, locales, support email
- `src/utils/PricingPlans.ts` — plans and limits (wire them to your billing provider)
- `.env` / `.env.production` — environment variables
- `public/` — favicon and app icons
- `src/templates/` — landing page sections
- `src/locales/*.json` — all user-visible copy

## AI coding agents

`skills/saas-builder/SKILL.md` contains the project conventions for AI coding agents (Codex, Claude Code, …). Install it with:

```shell
npx skills add <your-repo>
```

## License

MIT — see [LICENSE](LICENSE).
