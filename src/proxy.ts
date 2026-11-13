import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import { routing } from './libs/I18nRouting';

const handleI18nRouting = createMiddleware(routing);

// Routes that require an authenticated session. Everything else is public.
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/:locale/dashboard(.*)',
  '/onboarding(.*)',
  '/:locale/onboarding(.*)',
]);

// The organization selection page is part of onboarding but must stay
// accessible for users that are signed in without an organization yet.
const isOrgSelectionRoute = createRouteMatcher([
  '/onboarding/organization-selection',
  '/:locale/onboarding/organization-selection',
]);

const isDashboardRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/:locale/dashboard(.*)',
]);

// Extract the locale prefix from a pathname, e.g. "/fr/dashboard" => "fr"
const getLocale = (pathname: string) =>
  pathname.match(new RegExp(`^/(${routing.locales.join('|')})(/|$)`))?.at(1)
  ?? routing.defaultLocale;

// Build a locale-aware path: the default locale has no prefix (as-needed mode)
const toLocalePath = (path: string, locale: string) =>
  locale === routing.defaultLocale ? path : `/${locale}${path}`;

// Clerk middleware runs for every request so the auth state is available
// on public pages too (e.g. to render a user menu in the navbar).
export default clerkMiddleware(async (auth, req) => {
  // Protect dashboard and onboarding routes, redirect to a locale-aware sign-in page
  if (isProtectedRoute(req) && !isOrgSelectionRoute(req)) {
    const locale = getLocale(req.nextUrl.pathname);
    const signInUrl = new URL(toLocalePath('/sign-in', locale), req.url);

    await auth.protect({
      unauthenticatedUrl: signInUrl.toString(),
    });
  }

  // Redirect authenticated users without an organization to the organization
  // selection page. This ensures users are properly associated with an
  // organization before accessing the dashboard.
  const authObj = await auth();

  if (
    authObj.userId
    && !authObj.orgId
    && isDashboardRoute(req)
    && !isOrgSelectionRoute(req)
  ) {
    const locale = getLocale(req.nextUrl.pathname);
    const orgSelection = new URL(
      toLocalePath('/onboarding/organization-selection', locale),
      req.url,
    );

    return NextResponse.redirect(orgSelection);
  }

  return handleI18nRouting(req);
});

export const config = {
  // Match all pathnames except for
  // - … if they start with `/_next`, `/_vercel` or `monitoring`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!_next|_vercel|monitoring|.*\\..*).*)',
};
