import { sign, verify } from 'hono/jwt';
import type {
  ITokenService,
  IssuedTokens,
  TokenClaims,
} from '../../application/interfaces/identity/ITokenService';

/** Converte TTLs como "15m", "1h", "7d" em segundos. */
function ttlToSeconds(ttl: string): number {
  const match = /^(\d+)([smhd])$/.exec(ttl.trim());
  if (!match) {
    throw new Error(`TTL de token inválido: ${ttl}`);
  }
  const value = Number(match[1]);
  const unit = match[2] as 's' | 'm' | 'h' | 'd';
  const multipliers = { s: 1, m: 60, h: 3600, d: 86400 } as const;
  return value * multipliers[unit];
}

/** Emite e valida tokens JWT (HS256) com o helper do Hono. */
export class JwtTokenService implements ITokenService {
  private readonly accessTtl: number;
  private readonly refreshTtl: number;

  constructor(
    private readonly secret: string,
    accessTtl: string,
    refreshTtl: string,
  ) {
    this.accessTtl = ttlToSeconds(accessTtl);
    this.refreshTtl = ttlToSeconds(refreshTtl);
  }

  async issue(claims: TokenClaims): Promise<IssuedTokens> {
    const now = Math.floor(Date.now() / 1000);
    const accessToken = await sign(
      { ...claims, type: 'access', exp: now + this.accessTtl, iat: now },
      this.secret,
    );
    const refreshToken = await sign(
      { sub: claims.sub, type: 'refresh', exp: now + this.refreshTtl, iat: now },
      this.secret,
    );
    return { accessToken, refreshToken };
  }

  async verify(token: string): Promise<TokenClaims | null> {
    try {
      const payload = await verify(token, this.secret, 'HS256');
      if (payload.type !== 'access') {
        return null;
      }
      return {
        sub: String(payload.sub),
        email: String(payload.email ?? ''),
        roles: Array.isArray(payload.roles) ? (payload.roles as string[]) : [],
      };
    } catch {
      return null;
    }
  }
}
