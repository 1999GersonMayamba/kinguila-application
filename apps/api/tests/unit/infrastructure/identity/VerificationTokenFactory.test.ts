import { describe, expect, it } from 'bun:test';
import { VerificationTokenFactory } from '../../../../src/infrastructure/identity/VerificationTokenFactory';

describe('VerificationTokenFactory', () => {
  const factory = new VerificationTokenFactory();

  it('gera sempre um código de 6 dígitos numéricos', () => {
    for (let i = 0; i < 50; i++) {
      expect(factory.generateCode()).toMatch(/^\d{6}$/);
    }
  });

  it('os códigos variam (não são constantes)', () => {
    const codes = new Set(Array.from({ length: 50 }, () => factory.generateCode()));
    expect(codes.size).toBeGreaterThan(1);
  });

  it('gera tokens base64url únicos entre chamadas', () => {
    const a = factory.generateToken();
    const b = factory.generateToken();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('o hash é determinístico e difere por input', () => {
    expect(factory.hash('abc')).toBe(factory.hash('abc'));
    expect(factory.hash('abc')).not.toBe(factory.hash('xyz'));
  });

  it('verify é verdadeiro para o valor correto e falso para outro', () => {
    const hash = factory.hash('secret');
    expect(factory.verify('secret', hash)).toBe(true);
    expect(factory.verify('outro', hash)).toBe(false);
  });

  it('verify devolve false para hash malformado sem lançar', () => {
    expect(factory.verify('secret', 'nao-e-hex')).toBe(false);
  });
});
