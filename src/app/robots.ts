import type { MetadataRoute } from 'next';
import { routing } from '@/libs/I18nRouting';
import { getBaseUrl } from '@/utils/Helpers';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  // Private areas must be excluded for every supported locale, e.g.
  // `/dashboard`, `/fr/dashboard`, `/onboarding`, `/fr/sign-in`, …
  const privatePaths = ['/dashboard', '/onboarding', '/sign-in', '/sign-up'];

  const disallow = privatePaths.flatMap(path =>
    routing.locales.map((locale) => {
      if (locale === routing.defaultLocale) {
        return path;
      }
      return `/${locale}${path}`;
    }),
  );

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow,
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
