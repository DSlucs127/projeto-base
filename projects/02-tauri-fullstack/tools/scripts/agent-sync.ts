import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const agentPath = path.join(root, 'AGENT.md');
const changelogPath = path.join(root, 'specs/CHANGELOG.md');
const pluginsDirectory = path.join(root, 'plugins');
const marker = /<!-- generated:start -->[\s\S]*?<!-- generated:end -->/;

const plugins = readdirSync(pluginsDirectory, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && !entry.name.startsWith('_') && !entry.name.startsWith('.'))
  .map((entry) => entry.name)
  .sort();
const changelog = readFileSync(changelogPath, 'utf8');
const sourceHash = createHash('sha256')
  .update(changelog)
  .update(JSON.stringify(plugins))
  .digest('hex')
  .slice(0, 12);
const list = plugins.length === 0 ? '_Nenhum plugin ativo._' : plugins.map((id) => `- \`${id}\``).join('\n');
const generated = `<!-- generated:start -->
## Estado gerado

- Core version: \`1.0.0\`
- Plugins ativos: ${plugins.length}
- Hash specs/manifests: \`${sourceHash}\`

${list}
<!-- generated:end -->`;
const current = readFileSync(agentPath, 'utf8');
if (!marker.test(current)) {
  throw new Error('AGENT.md does not contain generated markers');
}
const next = current.replace(marker, generated);

if (process.argv.includes('--check')) {
  if (current !== next) {
    console.error('AGENT.md is stale. Run: pnpm agent:sync');
    process.exit(1);
  }
  console.log('AGENT.md OK');
} else {
  writeFileSync(agentPath, next);
  console.log('AGENT.md synchronized');
}
