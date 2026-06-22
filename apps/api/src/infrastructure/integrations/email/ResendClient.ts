import type {
  EmailMessage,
  IEmailProvider,
} from '../../../application/interfaces/integrations/IEmailProvider';
import { HttpIntegrationClient } from '../shared/HttpIntegrationClient';
import type { ResendSendEmailRequest, ResendSendEmailResponse } from './models/resendApi';

/**
 * Cliente HTTP tipado para a Resend (envio de email transacional). Segue o padrão
 * de integração: estende `HttpIntegrationClient`, implementa o contrato da
 * Application (`IEmailProvider`) e isola os modelos crus do fornecedor.
 */
export class ResendClient extends HttpIntegrationClient implements IEmailProvider {
  constructor(
    apiKey: string,
    private readonly from: string,
    baseUrl = 'https://api.resend.com/',
  ) {
    super('resend', {
      baseUrl,
      defaultHeaders: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
      timeoutMs: 10_000,
    });
  }

  async send(message: EmailMessage): Promise<void> {
    const body: ResendSendEmailRequest = {
      from: this.from,
      to: message.to,
      subject: message.subject,
      html: message.html,
    };
    await this.post<ResendSendEmailResponse>('/emails', body);
  }
}
