import type {
  ITokenService,
  IssuedTokens,
  RefreshClaims,
  TokenClaims,
} from '../../../src/application/interfaces/identity/ITokenService';

/** Fake do serviço de tokens: devolve tokens fixos e regista os claims emitidos. */
export class FakeTokenService implements ITokenService {
  issuedFor: TokenClaims[] = [];
  /** Controla o resultado de `verifyRefresh` nos testes. */
  refreshResult: RefreshClaims | null = null;

  async issue(claims: TokenClaims): Promise<IssuedTokens> {
    this.issuedFor.push(claims);
    return { accessToken: 'access-token', refreshToken: 'refresh-token' };
  }

  async verify(_token: string): Promise<TokenClaims | null> {
    return null;
  }

  async verifyRefresh(_token: string): Promise<RefreshClaims | null> {
    return this.refreshResult;
  }
}
