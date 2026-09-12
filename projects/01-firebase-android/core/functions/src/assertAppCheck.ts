import type { CallableRequest} from 'firebase-functions/v2/https';
import { HttpsError } from 'firebase-functions/v2/https';

/**
 * Verifica App Check em toda callable.
 *
 * - Em producao: exige token valido (App Check enforcado via `enforceAppCheck`).
 * - Em desenvolvimento: permite token debug quando `FUNCTIONS_EMULATOR=true`
 *   ou quando o environment e `local`.
 */
export async function assertAppCheck(req: CallableRequest): Promise<void> {
  const isDev = process.env.NODE_ENV !== 'production' || process.env.FUNCTIONS_EMULATOR === 'true';
  if (isDev) return;
  // Quando `enforceAppCheck: true` ja esta setado, Functions rejeita antes de chegar aqui.
  // Este helper fica para cenarios onde voce nao pode usar enforceAppCheck na assinatura.
  if (!req.app) {
    throw new HttpsError('failed-precondition', 'App Check token missing');
  }
}