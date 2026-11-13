'use client';

import * as Sentry from '@sentry/nextjs';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

export default function DashboardError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('DashboardError');

  useEffect(() => {
    Sentry.captureException(props.error);
  }, [props.error]);

  return (
    <div className="rounded-xl border border-border bg-card p-8 text-center">
      <h2 className="text-xl font-semibold">{t('title')}</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {t('description')}
      </p>
      <button
        type="button"
        onClick={() => props.reset()}
        className="
          mt-6 rounded-md bg-primary px-4 py-2 text-sm font-medium
          text-primary-foreground
          hover:bg-primary/90
        "
      >
        {t('retry')}
      </button>
    </div>
  );
}
