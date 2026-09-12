/**
 * Validacao de i18n do Firebase Android.
 *
 * 1. O catalogo canonico `shared/I18N-KEYS.json` define chaves com pontos
 *    (ex.: `auth.login.title`). No Android, resource names nao aceitam pontos,
 *    entao a conversao canonica e `.` -> `_` (ex.: `auth_login_title`).
 * 2. Toda chave do catalogo deve existir em `values/strings.xml` (pt-BR) e
 *    `values-en/strings.xml`, com o MESMO valor do catalogo.
 * 3. pt-BR e en devem ter exatamente as mesmas chaves (extras permitidos,
 *    desde que presentes nos dois locales).
 *
 * Sai com codigo 1 se houver divergencias.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, '..', '..');
const SHARED = path.resolve(ROOT, '..', '..', 'shared');
const RES_VALUES = path.resolve(ROOT, 'app/android/app/src/main/res/values/strings.xml');
const RES_EN = path.resolve(ROOT, 'app/android/app/src/main/res/values-en/strings.xml');

interface CatalogEntry {
  'pt-BR': string;
  en: string;
}

/** Le strings.xml em um Map name -> valor. */
function readXmlStrings(p: string): Map<string, string> {
  if (!fs.existsSync(p)) throw new Error(`Arquivo nao encontrado: ${p}`);
  const text = fs.readFileSync(p, 'utf8');
  const map = new Map<string, string>();
  const regex = /<string\s+name="([^"]+)">(.*?)<\/string>/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text))) map.set(m[1], decodeXml(m[2]));
  return map;
}

function decodeXml(value: string): string {
  return value
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

/**
 * Achata o catalogo. Uma folha e um objeto com as duas locales como strings.
 * A chave canonica e a chave interna (ja vem qualificada: `auth.login.title`).
 */
function flattenCatalog(value: unknown, out: Map<string, CatalogEntry>): void {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return;
  const node = value as Record<string, unknown>;
  const pt = node['pt-BR'];
  const en = node.en;
  if (typeof pt === 'string' && typeof en === 'string') {
    // detectado pela presenca das duas locales; a chave vem da chamada pai
    return;
  }
  for (const [key, child] of Object.entries(node)) {
    if (typeof child === 'object' && child !== null && !Array.isArray(child)) {
      const grand = child as Record<string, unknown>;
      if (typeof grand['pt-BR'] === 'string' && typeof grand.en === 'string') {
        out.set(key, { 'pt-BR': grand['pt-BR'] as string, en: grand.en as string });
      } else {
        flattenCatalog(child, out);
      }
    }
  }
}

const errors: string[] = [];
const catalog = new Map<string, CatalogEntry>();
flattenCatalog(JSON.parse(fs.readFileSync(path.resolve(SHARED, 'I18N-KEYS.json'), 'utf8')), catalog);

if (catalog.size === 0) {
  errors.push('catalogo compartilhado vazio ou malformado');
}

const toAndroidName = (key: string): string => key.replaceAll('.', '_');
const ptBR = readXmlStrings(RES_VALUES);
const en = readXmlStrings(RES_EN);

// 2. Catalogo presente nos dois locales, com o valor exato do catalogo.
for (const [key, entry] of catalog) {
  const name = toAndroidName(key);
  const ptValue = ptBR.get(name);
  const enValue = en.get(name);
  if (ptValue === undefined) errors.push(`chave canonica ${key} ausente em values/strings.xml (esperado: ${name})`);
  else if (ptValue !== entry['pt-BR']) errors.push(`values/strings.xml ${name}: "${ptValue}" difere do catalogo pt-BR "${entry['pt-BR']}"`);
  if (enValue === undefined) errors.push(`chave canonica ${key} ausente em values-en/strings.xml (esperado: ${name})`);
  else if (enValue !== entry.en) errors.push(`values-en/strings.xml ${name}: "${enValue}" difere do catalogo en "${entry.en}"`);
}

// 3. Paridade pt-BR <-> en para todas as chaves (incluindo extras).
for (const [name] of ptBR) {
  if (!en.has(name)) errors.push(`values-en/strings.xml: chave ${name} ausente`);
}
for (const [name] of en) {
  if (!ptBR.has(name)) errors.push(`values/strings.xml: chave ${name} ausente`);
}

if (errors.length > 0) {
  for (const error of errors) console.error(`[i18n] ${error}`);
  console.error(`\n${errors.length} divergencias de i18n.`);
  process.exit(1);
}
console.log(`i18n OK (${catalog.size} chaves canonicas, ${ptBR.size} strings por locale)`);
