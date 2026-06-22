import type { IVerificationTokenFactory } from '../../../src/application/interfaces/identity/IVerificationTokenFactory';

/** Fake determinístico: códigos/tokens previsíveis e hash simples e reversível. */
export class FakeVerificationTokenFactory implements IVerificationTokenFactory {
  nextCode = '123456';
  nextToken = 'token-abc';

  generateCode(): string {
    return this.nextCode;
  }

  generateToken(): string {
    return this.nextToken;
  }

  hash(value: string): string {
    return `hashed:${value}`;
  }

  verify(value: string, hash: string): boolean {
    return this.hash(value) === hash;
  }
}
