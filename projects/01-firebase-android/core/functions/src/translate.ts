import type { CallableRequest } from 'firebase-functions/v2/https';

import { pluginsRegistry } from './pluginsRegistry';

/**
 * Traduz uma chave i18n baseada no header Accept-Language ou em
 * req.data.lang. Fallback para `en` se chave nao existir.
 */
export function tr(req: CallableRequest, key: string, fallback: string = key): string {
  const headerLang = req.rawRequest?.headers['accept-language']?.toString().split(',')[0];
  const dataLang = (req.data?.lang as string | undefined);
  const lang = (dataLang ?? headerLang ?? 'en').startsWith('pt') ? 'pt-BR' : 'en';
  const dict = pluginsRegistry.getI18n(lang);
  return dict[key] ?? fallback;
}