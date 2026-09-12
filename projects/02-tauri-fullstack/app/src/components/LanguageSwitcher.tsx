import { Button } from '@template/design-system/components/Button';

import { useI18n } from '../i18n/I18nProvider';

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  const target = locale === 'pt-BR' ? 'en' : 'pt-BR';

  return (
    <Button
      variant="secondary"
      onClick={() => void setLocale(target)}
      aria-label={t('language.toggle')}
    >
      {locale === 'pt-BR' ? t('language.english') : t('language.portuguese')}
    </Button>
  );
}
