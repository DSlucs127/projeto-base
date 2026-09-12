import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { Injectable } from '@nestjs/common';

import type { PluginRegistryService } from '../plugins/plugin-registry.service';

type Locale = 'pt-BR' | 'en';
type MessageTree = { [key: string]: string | MessageTree };

const FALLBACK_LOCALE: Locale = 'pt-BR';

function isMessageTree(value: unknown): value is MessageTree {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function deepMerge(base: MessageTree, override: MessageTree): MessageTree {
  const out: MessageTree = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const current = out[key];
    out[key] =
      isMessageTree(value) && isMessageTree(current) ? deepMerge(current, value) : value;
  }
  return out;
}

function readCoreLocale(locale: Locale): MessageTree {
  // Resolve a partir do diretorio de execucao (core/api). Em dev e no container
  // o cwd e core/api, logo ../../core/i18n/locales e o local canonico.
  const file = path.resolve(process.cwd(), '../../core/i18n/locales', `${locale}.json`);
  if (!existsSync(file)) {
    console.warn(`[i18n] core locale file not found: ${file}`);
    return {};
  }
  const parsed = JSON.parse(readFileSync(file, 'utf8')) as unknown;
  return isMessageTree(parsed) ? parsed : {};
}

function findMessage(tree: MessageTree, key: string): string | undefined {
  let value: string | MessageTree | undefined = tree;
  for (const segment of key.split('.')) {
    if (typeof value === 'string' || !value) return undefined;
    value = value[segment];
  }
  return typeof value === 'string' ? value : undefined;
}

@Injectable()
export class I18nService {
  private readonly messages: Record<Locale, MessageTree>;

  constructor(pluginRegistry: PluginRegistryService) {
    const core = {
      'pt-BR': readCoreLocale('pt-BR'),
      en: readCoreLocale('en'),
    };
    this.messages = {
      'pt-BR': deepMerge(core['pt-BR'], pluginRegistry.messagesFor('pt-BR')),
      en: deepMerge(core.en, pluginRegistry.messagesFor('en')),
    };
  }

  localeFor(acceptLanguage?: string): Locale {
    return acceptLanguage?.toLowerCase().includes('en') ? 'en' : FALLBACK_LOCALE;
  }

  translate(key: string, acceptLanguage?: string): string {
    const locale = this.localeFor(acceptLanguage);
    const message = findMessage(this.messages[locale], key) ?? findMessage(this.messages[FALLBACK_LOCALE], key);
    if (!message) {
      throw new Error(`Missing core translation key: ${key}`);
    }
    return message;
  }
}
