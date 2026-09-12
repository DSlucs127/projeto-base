import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import type { CallableRequest } from 'firebase-functions/v2/https';

function db() {
  // initializeApp() runs in index.ts before any callable reaches this helper.
  // Keeping access lazy avoids resolving the Admin Firestore client on import.
  return getFirestore();
}

/**
 * Grava entrada em /audit_logs. A colecao tem regras de leitura so admin,
 * escrita exclusiva via Admin SDK (este helper).
 */
export async function audit(
  req: CallableRequest,
  action: string,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  const ip = (req.rawRequest?.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim();
  const ua = req.rawRequest?.headers['user-agent'] as string | undefined;
  await db().collection('audit_logs').add({
    actor_id: req.auth?.uid ?? 'anonymous',
    actor_type: req.auth ? 'user' : 'system',
    action,
    plugin_id: action.startsWith('plugin.') ? action.split('.')[1] : null,
    metadata: sanitize(metadata),
    ip,
    user_agent: ua,
    created_at: FieldValue.serverTimestamp(),
  });
}

/** Remove PII/segredos do metadata antes de persistir. */
const SENSITIVE_FRAGMENTS = [
  'password',
  'passwd',
  'secret',
  'token',
  'authorization',
  'bearer',
  'jwt',
  'apikey',
  'api_key',
  'credential',
  'cookie',
];

function sanitize(meta: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(meta)) {
    const key = k.toLowerCase();
    if (SENSITIVE_FRAGMENTS.some((fragment) => key.includes(fragment))) continue;
    out[k] = v;
  }
  return out;
}