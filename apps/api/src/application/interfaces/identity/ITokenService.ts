/** Conteúdo (claims) de um token de acesso. */
export interface TokenClaims {
  sub: string;
  email: string;
  roles: string[];
  /** Versão da sessão; comparada com a do utilizador para permitir revogação. */
  tokenVersion: number;
}

/** Claims mínimos transportados pelo refresh token. */
export interface RefreshClaims {
  sub: string;
  tokenVersion: number;
}

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
}

/** Emite e valida tokens JWT. Implementado na infrastructure. */
export interface ITokenService {
  issue(claims: TokenClaims): Promise<IssuedTokens>;
  /** Valida um access token; devolve os claims ou null se inválido/expirado. */
  verify(token: string): Promise<TokenClaims | null>;
  /** Valida um refresh token; devolve os claims mínimos ou null. */
  verifyRefresh(token: string): Promise<RefreshClaims | null>;
}
