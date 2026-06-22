/**
 * Gera e valida os segredos de verificação (código de confirmação e token de
 * reset). Isola a aleatoriedade (CSPRNG) e o hashing dos serviços, tornando-os
 * testáveis com fakes. Implementado na infrastructure.
 */
export interface IVerificationTokenFactory {
  /** Código numérico de 6 dígitos (para o ecrã de confirmação). */
  generateCode(): string;
  /** Token opaco longo (32 bytes, base64url) para o link de reset. */
  generateToken(): string;
  /** Hash SHA-256 (hex) do valor — só o hash é persistido. */
  hash(value: string): string;
  /** Comparação em tempo constante entre um valor cru e um hash guardado. */
  verify(value: string, hash: string): boolean;
}
