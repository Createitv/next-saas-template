import { getTranslations, setRequestLocale } from 'next-intl/server';
import { TitleBar } from '@/features/dashboard/TitleBar';
import { requireOrg } from '@/libs/Authz';

export default async function DashboardIndexPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'DashboardIndexPage',
  });

  // Every server-side data query in your app must start with this call.
  // `orgId` is the tenant key: always scope database queries with it, e.g.
  //   db.select().from(todoSchema).where(eq(todoSchema.orgId, orgId))
  const { userId, orgId, orgSlug, orgRole } = await requireOrg(locale);

  return (
    <>
      <TitleBar
        title={t('title_bar')}
        description={t('title_bar_description', { organization: orgSlug ?? orgId })}
      />

      <div className="
        grid grid-cols-1 gap-6
        @xl:grid-cols-2
      "
      >
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">
            {t('tenant_context_title')}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('tenant_context_description')}
          </p>

          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Organization ID</dt>
              <dd className="
                rounded-md bg-secondary px-2 py-1 font-mono text-xs break-all
                text-secondary-foreground
              "
              >
                {orgId}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Organization slug</dt>
              <dd className="
                rounded-md bg-secondary px-2 py-1 font-mono text-xs
                text-secondary-foreground
              "
              >
                {orgSlug ?? '—'}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Your role</dt>
              <dd className="
                rounded-md bg-secondary px-2 py-1 font-mono text-xs
                text-secondary-foreground
              "
              >
                {orgRole ?? '—'}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">User ID</dt>
              <dd className="
                rounded-md bg-secondary px-2 py-1 font-mono text-xs break-all
                text-secondary-foreground
              "
              >
                {userId}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">
            {t('next_steps_title')}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('next_steps_description')}
          </p>

          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm">
            <li>
              {t.rich('next_steps_schema', {
                code: chunks => (
                  <code className="
                    rounded-sm bg-secondary px-1 font-mono text-xs
                    text-secondary-foreground
                  "
                  >
                    {chunks}
                  </code>
                ),
              })}
            </li>
            <li>
              {t.rich('next_steps_migrate', {
                code: chunks => (
                  <code className="
                    rounded-sm bg-secondary px-1 font-mono text-xs
                    text-secondary-foreground
                  "
                  >
                    {chunks}
                  </code>
                ),
              })}
            </li>
            <li>
              {t.rich('next_steps_authz', {
                code: chunks => (
                  <code className="
                    rounded-sm bg-secondary px-1 font-mono text-xs
                    text-secondary-foreground
                  "
                  >
                    {chunks}
                  </code>
                ),
              })}
            </li>
            <li>
              {t.rich('next_steps_page', {
                code: chunks => (
                  <code className="
                    rounded-sm bg-secondary px-1 font-mono text-xs
                    text-secondary-foreground
                  "
                  >
                    {chunks}
                  </code>
                ),
              })}
            </li>
          </ol>
        </div>
      </div>
    </>
  );
};
