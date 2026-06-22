/**
 * Código de confirmação de conta enviado por email. Guarda-se apenas o hash do
 * código (nunca o valor cru). Uso único, com expiração e limite de tentativas.
 */
export interface EmailVerificationCode {
  id: string;
  userId: string;
  /** Hash (SHA-256) do código de 6 dígitos. */
  codeHash: string;
  /** Tentativas falhadas de validação; serve de base ao lockout. */
  attemptCount: number;
  expiresAt: Date;
  /** Momento em que foi consumido; null enquanto ativo. */
  consumedAt: Date | null;
  createdAt: Date;
}
