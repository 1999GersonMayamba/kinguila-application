/**
 * Token de reset de senha embutido num link de email. Guarda-se apenas o hash do
 * token opaco (nunca o valor cru). Uso único, com expiração.
 */
export interface PasswordResetToken {
  id: string;
  userId: string;
  /** Hash (SHA-256) do token opaco. */
  tokenHash: string;
  expiresAt: Date;
  /** Momento em que foi consumido; null enquanto ativo. */
  consumedAt: Date | null;
  createdAt: Date;
}
