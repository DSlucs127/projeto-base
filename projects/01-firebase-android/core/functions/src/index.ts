/**
 * Entry point das Cloud Functions do **core**.
 *
 * - Exporta `api`: callable principal que roteia para plugins.
 * - Exporta `setUserClaims` (admin only): atribui custom claims.
 *
 * Cada plugin registra suas callables no bundle default durante o boot
 * (veja `pluginsRegistry.ts`).
 */
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { onCall, HttpsError } from 'firebase-functions/v2/https';

import { assertAppCheck } from './assertAppCheck';
import { audit } from './audit';
import { bootPlugins, pluginsRegistry } from './pluginsRegistry';

initializeApp();
const pluginsReady = bootPlugins();

export const api = onCall(
  { enforceAppCheck: true },
  async (req) => {
    await assertAppCheck(req);
    await pluginsReady;
    const callableName = req.data?.callable as string | undefined;
    if (!callableName) {
      throw new HttpsError('invalid-argument', 'missing callable name');
    }
    const handler = pluginsRegistry.resolve(callableName);
    if (!handler) {
      if (pluginsRegistry.listCallables().length === 0) {
        throw new HttpsError(
          'failed-precondition',
          'No plugin callables are bundled. Add an active plugin and redeploy Functions.',
        );
      }
      throw new HttpsError('not-found', `callable ${callableName} not found`);
    }
    const result = await handler(req);
    await audit(req, `core.${callableName}`, { ok: true });
    return result;
  },
);

/** Atribui role e permissions para um usuario. Apenas admin. */
const ALLOWED_ROLES = new Set(['admin', 'member', 'guest']);
const PERMISSION_PATTERN = /^[a-z]+:[a-z_]+$/;
const MAX_PERMISSIONS = 100;

export const setUserClaims = onCall(
  { enforceAppCheck: true },
  async (req) => {
    await assertAppCheck(req);
    if (req.auth?.token.role !== 'admin') {
      throw new HttpsError('permission-denied', 'admin only');
    }
    const { uid, role, permissions } = req.data as {
      uid: string;
      role: 'admin' | 'member' | 'guest';
      permissions: string[];
    };
    const validPermissions =
      Array.isArray(permissions) &&
      permissions.length <= MAX_PERMISSIONS &&
      permissions.every((permission) => typeof permission === 'string' && PERMISSION_PATTERN.test(permission));
    if (typeof uid !== 'string' || uid.length === 0 || !ALLOWED_ROLES.has(role) || !validPermissions) {
      throw new HttpsError('invalid-argument', 'bad payload');
    }
    await getAuth().setCustomUserClaims(uid, { role, permissions });
    await audit(req, 'core.user.claims.set', { uid, role, permissions });
    return { ok: true };
  },
);