export type Locale = 'pt-BR' | 'en';
export type MessageValue = string | { [key: string]: MessageValue };
export type Messages = Record<string, MessageValue>;

export const FALLBACK_LOCALE: Locale = 'pt-BR';

export interface I18nRuntime {
  locale: Locale;
  messages: Messages;
}

export function detectLocale(language = navigator.language): Locale {
  return language.toLowerCase().startsWith('en') ? 'en' : FALLBACK_LOCALE;
}

function isMessages(value: unknown): value is Messages {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function deepMerge(base: Messages, override: Messages): Messages {
  const out: Messages = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const current = out[key];
    out[key] = isMessages(value) && isMessages(current) ? deepMerge(current, value) : value;
  }
  return out;
}

async function fetchMessages(locale: Locale): Promise<Messages> {
  const response = await fetch(`/locales/${locale}.json`, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Unable to load locale ${locale}`);
  }
  return (await response.json()) as Messages;
}

/**
 * Carrega o locale pedido com fallback canonico para pt-BR: chaves ausentes
 * no locale ativo caem no fallback (spec 05-i18n).
 */
export async function loadI18n(locale: Locale): Promise<I18nRuntime> {
  const [primary, fallback] = await Promise.all([
    fetchMessages(locale),
    locale === FALLBACK_LOCALE ? Promise.resolve<Messages>({}) : fetchMessages(FALLBACK_LOCALE),
  ]);
  return { locale, messages: deepMerge(fallback, primary) };
}

export function translate(messages: Messages, key: string): string {
  let value: MessageValue | undefined = messages;
  for (const part of key.split('.')) {
    if (typeof value === 'string' || !value) break;
    value = value[part];
  }
  if (typeof value !== 'string') {
    // Fallback: devolve a propria chave e avisa. Nao quebra a renderizacao.
    if (import.meta.env.DEV) {
      console.warn(`Missing UI translation key: ${key}`);
    }
    return key;
  }
  return value;
}
