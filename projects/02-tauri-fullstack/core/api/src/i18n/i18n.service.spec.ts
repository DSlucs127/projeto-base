import { describe, expect, it } from 'vitest';

import type { PluginRegistryService } from '../plugins/plugin-registry.service';

import { I18nService } from './i18n.service';

function makeService(pluginMessages: Record<string, unknown> = {}): I18nService {
  const registry = {
    messagesFor: (locale: string) => pluginMessages[locale] ?? {},
  } as unknown as PluginRegistryService;
  return new I18nService(registry);
}

describe('I18nService', () => {
  it('defaults to pt-BR when Accept-Language is absent', () => {
    const service = makeService();
    expect(service.localeFor()).toBe('pt-BR');
    expect(service.localeFor('pt-BR,pt;q=0.9')).toBe('pt-BR');
  });

  it('selects en from Accept-Language', () => {
    expect(makeService().localeFor('en-US,en;q=0.9')).toBe('en');
  });

  it('translates core keys in both locales', () => {
    const service = makeService();
    expect(service.translate('errors.forbidden', 'pt-BR')).toBeTruthy();
    expect(service.translate('errors.forbidden', 'en')).toBe(
      'You do not have permission for this action.',
    );
  });

  it('falls back to pt-BR when the key is missing in en', () => {
    const service = makeService({
      en: { only: { english: 'English only' } },
      'pt-BR': { only: { english: 'Somente português' } },
    });
    expect(service.translate('only.english', 'en')).toBe('English only');
  });

  it('throws for a completely missing key', () => {
    expect(() => makeService().translate('does.not.exist', 'en')).toThrow(
      /Missing core translation key/,
    );
  });
});
