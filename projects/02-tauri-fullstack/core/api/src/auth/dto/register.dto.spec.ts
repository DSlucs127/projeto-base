import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';

import { RegisterDto } from './register.dto';

async function validateDto(dto: Partial<RegisterDto>) {
  const instance = Object.assign(new RegisterDto(), dto);
  return validate(instance, { whitelist: true });
}

describe('RegisterDto', () => {
  it('accepts a valid registration payload', async () => {
    const errors = await validateDto({
      email: 'user@example.com',
      password: 'long-enough-password',
      displayName: 'Usuário',
    });
    expect(errors).toHaveLength(0);
  });

  it('rejects a malformed email', async () => {
    const errors = await validateDto({ email: 'not-an-email', password: 'long-enough-password' });
    expect(errors.some((error) => error.property === 'email')).toBe(true);
  });

  it('rejects passwords shorter than 12 characters', async () => {
    const errors = await validateDto({ email: 'user@example.com', password: 'short' });
    expect(errors.some((error) => error.property === 'password')).toBe(true);
  });

  it('rejects display names longer than 80 characters', async () => {
    const errors = await validateDto({
      email: 'user@example.com',
      password: 'long-enough-password',
      displayName: 'x'.repeat(81),
    });
    expect(errors.some((error) => error.property === 'displayName')).toBe(true);
  });
});
