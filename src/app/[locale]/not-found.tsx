'use client';

import { useTranslations } from 'next-intl';
import { buttonVariants } from '@/components/ui/buttonVariants';
import { Link } from '@/libs/I18nNavigation';

export default function NotFoundPage() {
  const t = useTranslations('NotFound');

  return (
    <div className="
      flex min-h-[60vh] flex-col items-center justify-center px-3 text-center
    "
    >
      <div className="text-7xl font-bold text-primary">404</div>
      <h1 className="mt-4 text-2xl font-semibold">{t('title')}</h1>
      <p className="mt-2 text-muted-foreground">{t('description')}</p>
      <Link
        href="/"
        className={`
          ${buttonVariants()}
          mt-8
        `}
      >
        {t('back_home')}
      </Link>
    </div>
  );
}
