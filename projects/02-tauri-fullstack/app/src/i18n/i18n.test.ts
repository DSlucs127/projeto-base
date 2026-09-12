import { describe, expect, it } from 'vitest';

import { detectLocale, translate, type Messages } from './i18n';

describe('i18n', () => {
  it('uses the required locale selection and nested keys', () => {
    const messages: Messages = { auth: { signIn: 'Entrar' } };

    expect(detectLocale('en-US')).toBe('en');
    expect(detectLocale('pt-BR')).toBe('pt-BR');
    expect(translate(messages, 'auth.signIn')).toBe('Entrar');
  });
});
