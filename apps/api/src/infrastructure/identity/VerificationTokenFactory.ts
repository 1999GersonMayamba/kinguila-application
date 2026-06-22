import { createHash, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import type { IVerificationTokenFactory } from '../../application/interfaces/identity/IVerificationTokenFactory';

/**
 * Implementação de `IVerificationTokenFactory` com CSPRNG do Node/Bun.
 * Códigos e tokens são gerados de forma criptograficamente segura (nunca
 * `Math.random`) e os segredos só saem em hash SHA-256.
 */
export class VerificationTokenFactory implements IVerificationTokenFactory {
  generateCode(): string {
    // randomInt é uniforme e seguro; padStart garante sempre 6 dígitos.
    return randomInt(0, 1_000_000).toString().padStart(6, '0');
  }

  generateToken(): string {
    return randomBytes(32).toString('base64url');
  }

  hash(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }

  verify(value: string, hash: string): boolean {
    const expected = Buffer.from(this.hash(value), 'hex');
    let actual: Buffer;
    try {
      actual = Buffer.from(hash, 'hex');
    } catch {
      return false;
    }
    if (expected.length !== actual.length) {
      return false;
    }
    return timingSafeEqual(expected, actual);
  }
}
