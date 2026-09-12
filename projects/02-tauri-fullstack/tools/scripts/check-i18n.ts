import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

type JsonObject = { [key: string]: JsonValue };
type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];

const root = path.resolve(import.meta.dirname, '../..');
const errors: string[] = [];

function isObject(value: JsonValue): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function flatten(value: JsonValue, prefix = ''): Map<string, string> {
  const output = new Map<string, string>();
  if (!isObject(value)) {
    output.set(prefix, Array.isArray(value) ? 'array' : typeof value);
    return output;
  }
  for (const [key, child] of Object.entries(value)) {
    const childPrefix = prefix ? `${prefix}.${key}` : key;
    if (isObject(child)) {
      for (const [nestedKey, type] of flatten(child, childPrefix)) output.set(nestedKey, type);
    } else {
      output.set(childPrefix, Array.isArray(child) ? 'array' : typeof child);
    }
  }
  return output;
}

function readJson(file: string): JsonObject {
  try {
    const parsed = JSON.parse(readFileSync(file, 'utf8')) as JsonValue;
    if (!isObject(parsed)) throw new Error('root must be an object');
    return parsed;
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'invalid JSON';
    throw new Error(`${file}: ${reason}`);
  }
}

function compare(ptPath: string, enPath: string): void {
  const pt = flatten(readJson(ptPath));
  const en = flatten(readJson(enPath));
  for (const [key, type] of pt) {
    if (!en.has(key)) errors.push(`${enPath}: missing key ${key}`);
    else if (en.get(key) !== type) errors.push(`${enPath}: key ${key} has incompatible type`);
  }
  for (const key of en.keys()) {
    if (!pt.has(key)) errors.push(`${ptPath}: missing key ${key}`);
  }
}

compare(
  path.join(root, 'app/public/locales/pt-BR.json'),
  path.join(root, 'app/public/locales/en.json'),
);

const pluginsDirectory = path.join(root, 'plugins');
for (const entry of readdirSync(pluginsDirectory, { withFileTypes: true })) {
  if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
  const pluginDirectory = path.join(pluginsDirectory, entry.name, 'locales');
  compare(path.join(pluginDirectory, 'pt-BR.json'), path.join(pluginDirectory, 'en.json'));
}

if (errors.length > 0) {
  for (const error of errors) console.error(`[i18n] ${error}`);
  process.exit(1);
}
console.log('i18n OK');
