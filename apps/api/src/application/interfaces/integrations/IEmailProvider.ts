/** Mensagem de email já composta (assunto + HTML) pronta a enviar. */
export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
}

/**
 * Contrato de envio de email transacional. A Application compõe o conteúdo
 * (assunto/HTML) e delega o envio; a implementação concreta (Resend) vive na
 * infrastructure e pode ser trocada sem tocar na lógica de negócio.
 */
export interface IEmailProvider {
  send(message: EmailMessage): Promise<void>;
}
