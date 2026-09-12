/**
 * Registry de plugins. Cada plugin chama `registry.addCallable(name, fn)`
 * em seu `registerPlugin(registry)`. O core expoe um callable `api` que
 * roteia para o handler certo pelo nome.
 */
import type { CallableRequest } from 'firebase-functions/v2/https';
import { HttpsError } from 'firebase-functions/v2/https';

import { activePluginRegistrars } from './generatedPlugins';

export type PluginCallable = (req: CallableRequest) => Promise<unknown>;

class PluginsRegistryImpl {
  private readonly routes = new Map<string, PluginCallable>();
  private readonly i18n: Record<string, Record<string, string>> = {};

  addCallable(name: string, fn: PluginCallable): void {
    if (this.routes.has(name)) {
      throw new Error(`callable ${name} already registered`);
    }
    this.routes.set(name, fn);
  }

  addI18n(lang: string, dict: Record<string, string>): void {
    const bag = (this.i18n[lang] ??= {});
    Object.assign(bag, dict);
  }

  resolve(name: string): PluginCallable | undefined {
    return this.routes.get(name);
  }

  listCallables(): string[] {
    return [...this.routes.keys()].sort();
  }

  getI18n(lang: string): Record<string, string> {
    return this.i18n[lang] ?? {};
  }
}

export const pluginsRegistry = new PluginsRegistryImpl();

/**
 * Registra todos os plugins compilados no unico bundle Functions "default".
 * O gerador transforma os plugins ativos em imports estaticos, de forma que
 * o registro e o callable `api` usam a mesma instancia em memoria.
 */
let bootPromise: Promise<void> | undefined;

export function bootPlugins(): Promise<void> {
  if (!bootPromise) {
    bootPromise = (async () => {
      for (const registerPlugin of activePluginRegistrars) {
        await registerPlugin(pluginsRegistry);
      }
    })();
  }
  return bootPromise;
}

export type PluginRegistrar = (registry: typeof pluginsRegistry) => void | Promise<void>;

/** Lanca HttpsError com mensagem localizada (se pt-BR/en registrado). */
export function localizedError(req: CallableRequest, key: string, code: HttpsError['code'] = 'failed-precondition'): never {
  const lang = (req.data?.lang as string) ?? (req.rawRequest?.headers['accept-language']?.toString().split(',')[0] ?? 'en');
  const dict = pluginsRegistry.getI18n(lang.startsWith('pt') ? 'pt-BR' : 'en');
  const msg = dict[key] ?? key;
  throw new HttpsError(code, msg);
}