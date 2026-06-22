/**
 * Modelos CRUS da API da Resend. Refletem o formato exato do fornecedor e NÃO
 * saem desta pasta — são mapeados a partir de `EmailMessage` no `ResendClient`.
 */
export interface ResendSendEmailRequest {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
}

export interface ResendSendEmailResponse {
  id: string;
}
