/** Utilizador registado. Pode ser comprador e/ou vendedor de divisas. */
export interface User {
  id: string;
  name: string;
  email: string;
  /** Hash da password (argon2id). Nunca é exposto em respostas. */
  passwordHash: string;
  roles: string[];
  /** Momento em que o email foi confirmado; null enquanto a conta não estiver confirmada. */
  emailConfirmedAt: Date | null;
  /**
   * Versão da sessão. Incluída nos claims dos tokens; o logout incrementa-a,
   * invalidando instantaneamente todos os tokens (access + refresh) emitidos antes.
   */
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
}
