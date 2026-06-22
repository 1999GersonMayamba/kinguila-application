export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

/**
 * Resposta do registo: a conta nasce por confirmar, por isso NÃO devolve tokens.
 * O utilizador tem de validar o código de email antes de obter sessão.
 */
export interface RegisterResponse {
  email: string;
  verificationRequired: boolean;
}

/** Confirmação de conta: insere o código de 6 dígitos recebido por email. */
export interface ConfirmEmailRequest {
  email: string;
  code: string;
}

/** Reenvio do código de confirmação. */
export interface ResendCodeRequest {
  email: string;
}

/** Pedido de reset de senha (envia o link por email). */
export interface RequestPasswordResetRequest {
  email: string;
}

/** Validação do token do link de reset, antes de mostrar o formulário. */
export interface ValidateResetTokenRequest {
  token: string;
}

/** Definição da nova senha através do token de reset. */
export interface ResetPasswordRequest {
  token: string;
  password: string;
}

/** Renovação de sessão: troca o refresh token por um novo par de tokens. */
export interface RefreshTokenRequest {
  refreshToken: string;
}
