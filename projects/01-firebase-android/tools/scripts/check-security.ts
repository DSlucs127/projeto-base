/**
 * Regras de seguranca:
 * - firestore.rules: deve usar "allow read, write: if false" como default
 *   para colecoes nao explicitamente liberadas.
 * - storage.rules: idem.
 * - functions: cada callable deve chamar assertAppCheck(req) antes de tocar em
 *   dados sensiveis (heuristica: arquivos em core/functions/src que
 *   exportem onCall*).
 *
 * Sai com codigo 1 se falhar.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, '..', '..');
const RULES = path.resolve(ROOT, 'firestore.rules');
const STORAGE = path.resolve(ROOT, 'storage.rules');
const FNS_DIR = path.resolve(ROOT, 'core/functions/src');
const PLUGINS_DIR = path.resolve(ROOT, 'plugins');

let errors = 0;

function checkRule(file: string, label: string) {
  if (!fs.existsSync(file)) { console.error(`[security] ${label} ausente`); errors++; return; }
  const txt = fs.readFileSync(file, 'utf8');
  if (!/allow\s+read,\s*write:\s*if\s+false/.test(txt)) {
    console.error(`[security] ${label}: default deny "allow read, write: if false" ausente`);
    errors++;
  }
}

checkRule(RULES, 'firestore.rules');
checkRule(STORAGE, 'storage.rules');

/** Todos os .ts sob uma raiz, recursivamente. */
function tsFilesUnder(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  const stack = [dir];
  while (stack.length > 0) {
    const current = stack.pop() as string;
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.name.endsWith('.ts')) out.push(full);
    }
  }
  return out;
}

// functions heuristics: core + qualquer codigo de callable de plugin.
const EXEMPT = new Set(['index.ts', 'pluginsRegistry.ts', 'generatedPlugins.ts']);
const sources = [
  ...tsFilesUnder(FNS_DIR),
  ...tsFilesUnder(PLUGINS_DIR),
];
for (const file of sources) {
  const txt = fs.readFileSync(file, 'utf8');
  if (!/onCall|onRequest/.test(txt)) continue;
  const name = path.relative(ROOT, file);
  if (EXEMPT.has(path.basename(file))) continue;
  if (!/assertAppCheck\(/.test(txt)) {
    console.error(`[security] ${name}: callable sem assertAppCheck`);
    errors++;
  }
}

if (errors > 0) { console.error(`\n${errors} falhas de seguranca.`); process.exit(1); }
console.log('security OK');