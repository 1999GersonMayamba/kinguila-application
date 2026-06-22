/**
 * Conteúdo (assunto + HTML) dos emails de autenticação. Vive na Application: o
 * fornecedor (Resend) recebe apenas a mensagem composta, não decide o conteúdo.
 */

interface EmailContent {
  subject: string;
  html: string;
}

const wrapper = (inner: string): string => `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1a2238;">
    <h1 style="font-size: 20px; font-weight: 800; color: #1a2238;">Kinguila</h1>
    ${inner}
    <p style="font-size: 12px; color: #8a93a6; margin-top: 24px;">
      Se não foi você a pedir isto, ignore este email.
    </p>
  </div>
`;

/** Email com o código de 6 dígitos para confirmar a conta. */
export function buildVerificationCodeEmail(code: string): EmailContent {
  return {
    subject: 'Confirme a sua conta Kinguila',
    html: wrapper(`
      <p style="font-size: 14px;">Use o código abaixo para confirmar a sua conta:</p>
      <div style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #1f9d57; margin: 16px 0;">
        ${code}
      </div>
      <p style="font-size: 13px; color: #8a93a6;">O código expira dentro de alguns minutos.</p>
    `),
  };
}

/** Email com o link (token) para redefinir a senha. */
export function buildPasswordResetEmail(link: string): EmailContent {
  return {
    subject: 'Redefinição de senha — Kinguila',
    html: wrapper(`
      <p style="font-size: 14px;">Recebemos um pedido para redefinir a sua senha. Clique no botão:</p>
      <p style="margin: 20px 0;">
        <a href="${link}" style="background: #1f9d57; color: #fff; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Redefinir senha
        </a>
      </p>
      <p style="font-size: 13px; color: #8a93a6;">O link expira dentro de pouco tempo e só pode ser usado uma vez.</p>
    `),
  };
}
