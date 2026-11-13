import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getI18nPath } from '@/utils/Helpers';
import { routing } from './I18nRouting';

/**
 * Server-side authorization helpers.
 *
 * Usage: call these at the very beginning of every Server Component that
 * renders protected data, every Server Action and every Route Handler.
 * The middleware (`src/proxy.ts`) only handles redirects for page
 * navigation — it is NOT an authorization boundary for your data.
 */

/** Require a signed-in user, otherwise redirect to the sign-in page. */
export async function requireSession(): Promise<{
  userId: string;
}> {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    // `redirectToSignIn` throws a redirect, it never returns
    return redirectToSignIn();
  }

  return { userId };
}

/**
 * Require a signed-in user with an active organization (tenant).
 * Otherwise redirect to sign-in / the organization selection page.
 *
 * `orgId` is the tenant key: scope every database query with it, e.g.
 * `db.select().from(todoSchema).where(eq(todoSchema.orgId, orgId))`.
 */
export async function requireOrg(locale: string = routing.defaultLocale): Promise<{
  userId: string;
  orgId: string;
  orgSlug: string | null | undefined;
  orgRole: string | undefined;
}> {
  const { userId, orgId, orgSlug, orgRole, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn();
  }

  if (!orgId) {
    redirect(getI18nPath('/onboarding/organization-selection', locale));
  }

  return { userId, orgId, orgSlug, orgRole };
}
