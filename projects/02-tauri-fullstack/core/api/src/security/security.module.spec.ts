import { describe, expect, it } from 'vitest';

import { decrypt, encrypt } from '../database/prisma-crypto.extension';

describe('data encryption', () => {
  it('round-trips encrypted data and yields distinct ciphertexts', () => {
    process.env.DATA_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString('base64');

    const first = encrypt('sensitive display name');
    const second = encrypt('sensitive display name');

    expect(first).toMatch(/^enc:v1:/);
    expect(first).not.toBe(second);
    expect(decrypt(first)).toBe('sensitive display name');
  });
});
