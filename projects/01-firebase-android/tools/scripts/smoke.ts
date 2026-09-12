/**
 * Smoke test do backend local (emuladores Firebase).
 * - Sobe os emuladores
 * - Aguarda o startup
 * - Solicita uma chamada manual ao callable `api`
 */
import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';

console.log('[smoke] iniciando emuladores...');
const proc = spawn('firebase', ['emulators:start', '--only', 'auth,firestore,functions'], {
  stdio: 'inherit',
  shell: true,
});

process.on('SIGINT', () => proc.kill('SIGINT'));
process.on('SIGTERM', () => proc.kill('SIGTERM'));

await wait(25000);
console.log('[smoke] emuladores devem estar prontos. Chame um callable manualmente para validar o fluxo.');
console.log('[smoke] encerrando...');
proc.kill('SIGINT');
await wait(2000);