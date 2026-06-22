/** Conteúdo (claims) de um token de acesso. */
export interface TokenClaims {
  sub: string;
  email: string;
  roles: string[];
}

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
}

/** Emite e valida tokens JWT. Implementado na infrastructure. */
export interface ITokenService {
  issue(claims: TokenClaims): Promise<IssuedTokens>;
  verify(token: string): Promise<TokenClaims | null>;
}
