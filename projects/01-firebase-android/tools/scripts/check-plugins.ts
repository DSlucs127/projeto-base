/**
 * Validacao dos manifests de plugins:
 * - Cada subdiretorio de plugins/ que tenha plugin.json deve validar contra
 *   plugins/_template/plugin.schema.json.
 * - id deve ser kebab-case ou dotted; version SemVer; permissions[] nao vazio.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, '..', '..');
const PLUGINS = path.resolve(ROOT, 'plugins');
const SCHEMA_PATH = path.resolve(PLUGINS, '_template/plugin.schema.json');

if (!fs.existsSync(SCHEMA_PATH)) {
  console.error(`[plugins] schema ausente em ${SCHEMA_PATH}`);
  process.exit(1);
}

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const validate = ajv.compile(JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8')));

const semver = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[A-Za-z0-9.-]+)?(?:\+[A-Za-z0-9.-]+)?$/;
const idRe = /^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)*$/;

let errors = 0;
const entries = fs.readdirSync(PLUGINS, { withFileTypes: true });
for (const e of entries) {
  if (!e.isDirectory() || e.name.startsWith('_') || e.name.startsWith('.')) continue;
  const manifest = path.resolve(PLUGINS, e.name, 'plugin.json');
  if (!fs.existsSync(manifest)) {
    console.error(`[plugins] pasta ${e.name} sem plugin.json`);
    errors++; continue;
  }
  const json = JSON.parse(fs.readFileSync(manifest, 'utf8'));
  const ok = validate(json);
  if (!ok) {
    console.error(`[plugins] ${e.name}/plugin.json invalido:`);
    for (const err of validate.errors ?? []) console.error(`  - ${err.instancePath} ${err.message}`);
    errors++; continue;
  }
  if (!semver.test(json.version)) {
    console.error(`[plugins] ${e.name}: version nao e SemVer (${json.version})`);
    errors++;
  }
  if (!idRe.test(json.id)) {
    console.error(`[plugins] ${e.name}: id nao e kebab.dotted (${json.id})`);
    errors++;
  }
  if (!Array.isArray(json.permissions) || json.permissions.length === 0) {
    console.error(`[plugins] ${e.name}: permissions[] vazio (deve pedir no minimo 1 permissao)`);
    errors++;
  }
  const modulePath = json.functions?.module;
  const register = json.functions?.register;
  if (typeof modulePath !== 'string' || !modulePath.startsWith('./functions/src/')) {
    console.error(`[plugins] ${e.name}: functions.module deve apontar para ./functions/src/*.ts`);
    errors++;
  } else {
    const pluginDir = path.resolve(PLUGINS, e.name);
    const moduleFile = path.resolve(pluginDir, modulePath);
    if (!moduleFile.startsWith(`${pluginDir}${path.sep}`)) {
      console.error(`[plugins] ${e.name}: functions.module nao pode sair da pasta do plugin`);
      errors++;
    } else if (!fs.existsSync(moduleFile)) {
      console.error(`[plugins] ${e.name}: modulo Functions declarado nao existe (${modulePath})`);
      errors++;
    }
  }
  if (typeof register !== 'string' || !/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(register)) {
    console.error(`[plugins] ${e.name}: functions.register deve ser um export TypeScript valido`);
    errors++;
  }
}

if (errors > 0) { console.error(`\n${errors} erros de plugin.`); process.exit(1); }
console.log('plugins OK');