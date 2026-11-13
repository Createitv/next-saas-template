import type { Metadata, Viewport } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { shadcn } from '@clerk/ui/themes';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/libs/I18nRouting';
import { AppConfig, ClerkLocalizations } from '@/utils/AppConfig';
import { getBaseUrl, getI18nPath } from '@/utils/Helpers';
import '@/styles/global.css';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;

  return {
    // Used as the base URL for canonical, Open Graph and Twitter metadata
    metadataBase: new URL(getBaseUrl()),
    title: {
      default: `${AppConfig.name} - ${AppConfig.tagline}`,
      template: `%s | ${AppConfig.name}`,
    },
    description: AppConfig.description,
    applicationName: AppConfig.name,
    alternates: {
      canonical: getI18nPath('/', locale),
      languages: Object.fromEntries(
        routing.locales.map(item => [
          item,
          getI18nPath('/', item),
        ]),
      ),
    },
    openGraph: {
      type: 'website',
      siteName: AppConfig.name,
      title: `${AppConfig.name} - ${AppConfig.tagline}`,
      description: AppConfig.description,
      url: getI18nPath('/', locale),
      locale,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${AppConfig.name} - ${AppConfig.tagline}`,
      description: AppConfig.description,
    },
    icons: [
      {
        rel: 'apple-touch-icon',
        url: '/apple-touch-icon.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        url: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        url: '/favicon-16x16.png',
      },
      {
        rel: 'icon',
        url: '/favicon.ico',
      },
    ],
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const clerkLocale = ClerkLocalizations.supportedLocales[locale]
    ?? ClerkLocalizations.defaultLocale;

  return (
    <ClerkProvider
      appearance={{
        cssLayerName: 'clerk', // Ensure Clerk is compatible with Tailwind CSS v4
        theme: shadcn,
      }}
      localization={clerkLocale}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
      afterSignOutUrl="/"
    >
      <html lang={locale} suppressHydrationWarning>
        <body>
          <NextIntlClientProvider>
            {props.children}
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
