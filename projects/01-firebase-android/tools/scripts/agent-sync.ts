/**
 * Synchronizes the generated state block in AGENT.md with the deployable
 * template configuration. Project rules remain editable outside that block.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..', '..');
const agentPath = path.join(root, 'AGENT.md');
const firebasePath = path.join(root, 'firebase.json');
const androidSettingsPath = path.join(root, 'app', 'android', 'settings.gradle.kts');
const generatedState = /<!-- generated-state:start -->[\s\S]*?<!-- generated-state:end -->/;

const firebase = JSON.parse(fs.readFileSync(firebasePath, 'utf8'));
const functions = firebase.functions;
if (!Array.isArray(functions) || functions.length !== 1 ||
    functions[0]?.codebase !== 'default' || functions[0]?.source !== 'core/functions') {
  throw new Error('firebase.json must define exactly the default core/functions codebase');
}
if (firebase.hosting) {
  throw new Error('hosting must not be declared without a deployable web application');
}
const androidSettings = fs.readFileSync(androidSettingsPath, 'utf8');
const androidBuild = fs.readFileSync(path.join(root, 'app', 'android', 'app', 'build.gradle.kts'), 'utf8');
if (!androidSettings.includes('include(":design-system")')) {
  throw new Error('Android settings must include the design-system module');
}
if (!androidBuild.includes('java.srcDir("../../../core")')) {
  throw new Error('Android app must map the shared core Kotlin sources');
}

const state = [
  '<!-- generated-state:start -->',
  '## Estado gerado',
  '',
  '- Android inclui `:design-system` e mapeia `../../../core` como fonte Kotlin do app.',
  '- Firebase deploya um unico codebase Functions (`default`, `core/functions`); Hosting nao e configurado neste template.',
  '- `npm run build` gera os registrars dos plugins ativos no bundle Functions padrao antes de compilar.',
  '- O template nao contem plugins ativos: `api` responde claramente que nenhum callable foi empacotado ate que um plugin seja adicionado e o deploy seja refeito.',
  '<!-- generated-state:end -->',
].join('\n');

const agent = fs.readFileSync(agentPath, 'utf8');
if (!generatedState.test(agent)) {
  throw new Error('AGENT.md is missing the generated-state markers');
}
fs.writeFileSync(agentPath, agent.replace(generatedState, state));
console.log(`AGENT.md synchronized (${agentPath})`);
