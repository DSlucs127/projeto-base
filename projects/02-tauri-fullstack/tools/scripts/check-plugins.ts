import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const root = path.resolve(import.meta.dirname, '../..');
const pluginsDirectory = path.join(root, 'plugins');
const schemaPath = path.join(pluginsDirectory, '_template/plugin.schema.json');
const schema = JSON.parse(readFileSync(schemaPath, 'utf8')) as object;
const ajv = new Ajv({ allErrors: true, strict: true });
addFormats(ajv);
const validate = ajv.compile(schema);
const entrypointPattern = /^backend\/[A-Za-z0-9_./-]+\.js$/;
const errors: string[] = [];

for (const entry of readdirSync(pluginsDirectory, { withFileTypes: true })) {
  if (!entry.isDirectory() || entry.name.startsWith('_') || entry.name.startsWith('.')) continue;

  const pluginDirectory = path.join(pluginsDirectory, entry.name);
  const manifestPath = path.join(pluginDirectory, 'plugin.json');
  if (!existsSync(manifestPath)) {
    errors.push(`${entry.name}: plugin.json is required`);
    continue;
  }

  let manifest: unknown;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as unknown;
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'invalid JSON';
    errors.push(`${entry.name}: ${reason}`);
    continue;
  }

  if (!validate(manifest)) {
    const details = (validate.errors ?? [])
      .map((error) => `${error.instancePath || '/'} ${error.message ?? 'invalid'}`)
      .join('; ');
    errors.push(`${entry.name}: ${details}`);
    continue;
  }

  // O entrypoint deve existir, ser backend/*.js e ficar dentro da pasta do plugin.
  const declared = (manifest as { backend?: { entrypoint?: string } }).backend?.entrypoint;
  if (typeof declared !== 'string' || !entrypointPattern.test(declared)) {
    errors.push(`${entry.name}: backend.entrypoint must match ${entrypointPattern}`);
    continue;
  }
  const entryPath = path.resolve(pluginDirectory, declared);
  if (!entryPath.startsWith(`${path.resolve(pluginDirectory)}${path.sep}`)) {
    errors.push(`${entry.name}: backend.entrypoint escapes the plugin directory`);
  } else if (!existsSync(entryPath)) {
    errors.push(`${entry.name}: backend.entrypoint does not exist (${declared})`);
  }
}

if (errors.length > 0) {
  for (const error of errors) console.error(`[plugins] ${error}`);
  process.exit(1);
}
console.log('plugins OK');
