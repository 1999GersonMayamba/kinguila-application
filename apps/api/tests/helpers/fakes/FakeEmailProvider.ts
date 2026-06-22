import type {
  EmailMessage,
  IEmailProvider,
} from '../../../src/application/interfaces/integrations/IEmailProvider';

/** Fake do fornecedor de email: regista o que foi "enviado" e pode simular falha. */
export class FakeEmailProvider implements IEmailProvider {
  sent: EmailMessage[] = [];
  shouldFail = false;

  async send(message: EmailMessage): Promise<void> {
    if (this.shouldFail) {
      throw new Error('Fornecedor de email indisponível.');
    }
    this.sent.push(message);
  }
}
