/** Utilizador registado. Pode ser comprador e/ou vendedor de divisas. */
export interface User {
  id: string;
  name: string;
  email: string;
  /** Hash da password (argon2id). Nunca é exposto em respostas. */
  passwordHash: string;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
}
