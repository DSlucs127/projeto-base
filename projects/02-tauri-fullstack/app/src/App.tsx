
import { Button } from '@template/design-system/components/Button';
import { Card } from '@template/design-system/components/Card';
import { useEffect, useState } from 'react';

import { LanguageSwitcher } from './components/LanguageSwitcher';
import { useI18n } from './i18n/I18nProvider';
import { api } from './lib/api';
import { usePlugins } from './lib/usePlugins';

type HealthState = 'loading' | 'available' | 'unavailable';

export function App() {
  const { locale, t } = useI18n();
  const [health, setHealth] = useState<HealthState>('loading');
  const [healthAttempt, setHealthAttempt] = useState(0);
  const plugins = usePlugins(locale);

  useEffect(() => {
    let active = true;
    setHealth('loading');
    void api.health(locale).then(
      () => active && setHealth('available'),
      () => active && setHealth('unavailable'),
    );
    return () => {
      active = false;
    };
  }, [locale, healthAttempt]);

  return (
    <main className="mx-auto grid min-h-screen max-w-5xl content-center gap-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-brand">{t('app.eyebrow')}</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-ink">
            {t('app.title')}
          </h1>
        </div>
        <LanguageSwitcher />
      </header>

      <Card>
        <h2 className="text-xl font-semibold text-ink">{t('core.title')}</h2>
        <p className="mt-2 text-slate-600">{t('core.description')}</p>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold text-ink">{t('plugins.title')}</h2>
        <p className="mt-2 text-slate-600">{t('plugins.description')}</p>
        {plugins.routes.length > 0 ? (
          <ul className="mt-4 list-inside list-disc space-y-1">
            {plugins.routes.map((route) => (
              <li key={route.path}>
                <span className="font-medium text-ink">{t(route.titleKey)}</span>{' '}
                <span className="text-slate-500">{route.path}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-slate-500" aria-live="polite">
            {plugins.unavailable ? t('plugins.unavailable') : t('plugins.empty')}
          </p>
        )}
      </Card>

      <Card>
        <h2 className="text-xl font-semibold text-ink">{t('health.title')}</h2>
        <p className="mt-2 text-slate-600" aria-live="polite">
          {t(`health.${health}`)}
        </p>
        {health === 'unavailable' && (
          <Button
            className="mt-4"
            onClick={() => setHealthAttempt((attempt) => attempt + 1)}
          >
            {t('health.retry')}
          </Button>
        )}
      </Card>
    </main>
  );
}
