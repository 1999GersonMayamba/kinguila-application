/** Contrato de hashing de passwords. Implementado na infrastructure (argon2id). */
export interface IPasswordHasher {
  hash(plain: string): Promise<string>;
  verify(plain: string, hash: string): Promise<boolean>;
}
