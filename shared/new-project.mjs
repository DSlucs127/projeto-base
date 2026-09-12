/**
 * Cria um novo projeto a partir de um template deste repositorio.
 *
 * Uso (a partir da raiz do repositorio "Projeto base"):
 *   node shared/new-project.mjs --from projects/02-tauri-fullstack --to ../meu-app --slug meu-app
 *   node shared/new-project.mjs --from projects/01-firebase-android --to ../meu-app-android
 *
 * O que o script faz:
 *   1. Copia o template ignorando node_modules, builds, .env e segredos.
 *   2. Renomeia identificadores: "@template/" -> "@<slug>/", nomes de package
 *      raiz e titulos de README/AGENT.
 *   3. Aplica um tema opcional: --theme <nome> (ver design-system/THEMES.md).
 *   4. Imprime o checklist obrigatorio que nenhum script pode fazer por voce.
 *
 * O script nunca modifica o template de origem.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function argValue(name) {
  const index = process.argv.indexOf('--' + name);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

function fail(message) {
  console.error('[new-project] ERRO: ' + message);
  process.exit(1);
}

const from = path.resolve(argValue('from') ?? fail('--from e obrigatorio (projects/01-... ou projects/02-...)'));
const to = path.resolve(argValue('to') ?? fail('--to e obrigatorio (caminho do novo projeto)'));
const slug = (argValue('slug') ?? path.basename(to)).toLowerCase();

if (!fs.existsSync(path.join(from, 'package.json'))) {
  fail('--from nao parece um template: ' + from);
}
if (fs.existsSync(to) && fs.readdirSync(to).length > 0) {
  fail('--to ja existe e nao esta vazio: ' + to);
}
if (!/^[a-z][a-z0-9-]*$/.test(slug)) {
  fail('slug deve ser kebab-case (letras minusculas, numeros e hifens).');
}

const IGNORED = new Set([
  'node_modules', 'dist', 'coverage', '.turbo', '.vite',
  '.gradle', 'build', '.emu-data', '.eslintcache',
  '.env', 'google-services.json', '.DS_Store', 'Thumbs.db',
]);

function copySync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (IGNORED.has(entry.name)) continue;
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copySync(s, d);
    else fs.copyFileSync(s, d);
  }
}

console.log('[new-project] copiando ' + from + ' -> ' + to);
copySync(from, to);

// Identificadores conhecidos dos templates. Substituicao textual e
// idempotente; se o template ganhar um nome novo, adicione o par aqui.
const PLACEHOLDER = '@@SLUG@@';
const REPLACEMENTS = [
  ['tauri-fullstack-template', PLACEHOLDER + '-template'],
  ['firebase-android-template', PLACEHOLDER + '-template'],
  ['@template/', '@' + slug + '/'],
  ['02-tauri-fullstack', slug],
  ['01-firebase-android', slug],
  [PLACEHOLDER, slug],
];

const TEXT_EXT = new Set([
  '.json', '.md', '.ts', '.tsx', '.mjs', '.js', '.kts', '.kt',
  '.yml', '.yaml', '.toml', '.css', '.html', '.xml', '.example',
]);

let rewritten = 0;
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (TEXT_EXT.has(path.extname(entry.name))) {
      const text = fs.readFileSync(full, 'utf8');
      let out = text;
      for (const [search, replace] of REPLACEMENTS) out = out.split(search).join(replace);
      if (out !== text) {
        fs.writeFileSync(full, out);
        rewritten++;
      }
    }
  }
}
walk(to);
console.log('[new-project] ' + rewritten + ' arquivo(s) com identificadores renomeados para "' + slug + '"');

// Tema opcional (depois das substituicoes; caminhos relativos ao novo projeto).
const theme = argValue('theme');
if (theme) {
  console.log('[new-project] aplicando tema "' + theme + '"');
  const syncScript = path.join(repoRoot, 'shared', 'design-system', 'sync-tokens.mjs');
  const result = spawnSync(process.execPath, [syncScript, '--theme', theme], { cwd: to, stdio: 'inherit' });
  if (result.status !== 0) fail('falha ao aplicar o tema (veja o erro acima).');
}

const isTauri = fs.existsSync(path.join(to, 'pnpm-workspace.yaml'));
const installLine = isTauri
  ? 'cp .env.example .env e preencha DATABASE_URL + segredos; rode: pnpm install'
  : 'npm install; depois coloque o google-services.json real em app/android/app/';
const metadataLine = isTauri
  ? 'app/src-tauri/tauri.conf.json (productName e identifier)'
  : 'app/android/build.gradle.kts (namespace e applicationId)';
const validateLine = isTauri
  ? 'pnpm validate && pnpm typecheck && pnpm test'
  : 'npm run validate && npm run typecheck';
console.log('');
console.log('[new-project] Projeto criado em ' + to);
console.log('');
console.log('CHECKLIST OBRIGATORIO (nenhum script pode fazer isso por voce):');
console.log(' 1. git init && primeiro commit.');
console.log(' 2. ' + installLine);
console.log(' 3. Revise nome/descricao no README.md, AGENT.md e metadata: ' + metadataLine);
console.log(' 4. Escolha/crie um tema: node ../../shared/design-system/sync-tokens.mjs --theme <nome>');
console.log('    (catalogo em shared/design-system/THEMES.md).');
console.log(' 5. Preencha as locales pt-BR/en com as strings do SEU dominio.');
console.log(' 6. Rode os validadores: ' + validateLine);
console.log(' 7. Registre o bootstrap no specs/CHANGELOG.md (append-only).');
console.log(' 8. Leia shared/AI-ONBOARDING.md antes de qualquer agente trabalhar no projeto.');
