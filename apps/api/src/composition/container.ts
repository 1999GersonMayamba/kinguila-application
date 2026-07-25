import { AdminUserService } from '../application/services/AdminUserService';
import { AuthService } from '../application/services/AuthService';
import { CurrencyService } from '../application/services/CurrencyService';
import { EmailVerificationService } from '../application/services/EmailVerificationService';
import { OfferService } from '../application/services/OfferService';
import { PasswordResetService } from '../application/services/PasswordResetService';
import { env } from '../config/env';
import { createDatabase } from '../infrastructure/database/client';
import { JwtTokenService } from '../infrastructure/identity/JwtTokenService';
import { PasswordHasher } from '../infrastructure/identity/PasswordHasher';
import { VerificationTokenFactory } from '../infrastructure/identity/VerificationTokenFactory';
import { ResendClient } from '../infrastructure/integrations/email/ResendClient';
import { ExchangeRateClient } from '../infrastructure/integrations/exchangeRate/ExchangeRateClient';
import { CurrencyRepository } from '../infrastructure/repositories/CurrencyRepository';
import { EmailVerificationCodeRepository } from '../infrastructure/repositories/EmailVerificationCodeRepository';
import { OfferRepository } from '../infrastructure/repositories/OfferRepository';
import { PasswordResetTokenRepository } from '../infrastructure/repositories/PasswordResetTokenRepository';
import { UserRepository } from '../infrastructure/repositories/UserRepository';
import { AdminUserController } from '../presentation/http/controllers/AdminUserController';
import { AuthController } from '../presentation/http/controllers/AuthController';
import { CurrencyController } from '../presentation/http/controllers/CurrencyController';
import { OfferController } from '../presentation/http/controllers/OfferController';
import { authMiddleware } from '../presentation/http/middlewares/authMiddleware';
import { ttlToSeconds } from '../shared/ttl';

/**
 * Composition root: o único sítio que conhece implementações concretas.
 * Instancia e liga tudo (DI manual). Ao adicionar um recurso novo, regista aqui
 * o repositório, o serviço e o controller (ver skill add-entity).
 */
export function buildContainer() {
  // Infraestrutura
  const db = createDatabase();
  const passwordHasher = new PasswordHasher();
  const tokenService = new JwtTokenService(
    env.JWT_SECRET,
    env.JWT_ACCESS_TOKEN_TTL,
    env.JWT_REFRESH_TOKEN_TTL,
  );
  const verificationTokenFactory = new VerificationTokenFactory();

  // Integrações externas (fornecedores). Injetar nos serviços que as consomem.
  const exchangeRateProvider = new ExchangeRateClient(
    env.EXCHANGE_RATE_API_URL,
    env.EXCHANGE_RATE_API_KEY,
  );
  const emailProvider = new ResendClient(env.RESEND_API_KEY, env.EMAIL_FROM, env.RESEND_API_URL);

  // Repositórios
  const userRepository = new UserRepository(db);
  const currencyRepository = new CurrencyRepository(db);
  const offerRepository = new OfferRepository(db);
  const emailVerificationCodeRepository = new EmailVerificationCodeRepository(db);
  const passwordResetTokenRepository = new PasswordResetTokenRepository(db);

  // Serviços
  const emailVerificationService = new EmailVerificationService(
    userRepository,
    emailVerificationCodeRepository,
    verificationTokenFactory,
    emailProvider,
    tokenService,
    {
      codeTtlSeconds: ttlToSeconds(env.EMAIL_CODE_TTL),
      resendRateLimitSeconds: env.EMAIL_RESEND_RATE_LIMIT_SECONDS,
      maxAttempts: env.EMAIL_CODE_MAX_ATTEMPTS,
    },
  );
  const passwordResetService = new PasswordResetService(
    userRepository,
    passwordResetTokenRepository,
    verificationTokenFactory,
    emailProvider,
    passwordHasher,
    {
      tokenTtlSeconds: ttlToSeconds(env.PASSWORD_RESET_TOKEN_TTL),
      webAppUrl: env.WEB_APP_URL,
    },
  );
  const authService = new AuthService(
    userRepository,
    passwordHasher,
    tokenService,
    emailVerificationService,
  );
  const currencyService = new CurrencyService(currencyRepository);
  const offerService = new OfferService(offerRepository, currencyRepository);
  const adminUserService = new AdminUserService(userRepository, passwordResetService);

  // Controllers
  const authController = new AuthController(
    authService,
    emailVerificationService,
    passwordResetService,
  );
  const currencyController = new CurrencyController(currencyService);
  const offerController = new OfferController(offerService);
  const adminUserController = new AdminUserController(adminUserService);

  // Middleware de autenticação (valida o JWT e o tokenVersion contra a BD)
  const requireAuth = authMiddleware(tokenService, userRepository);

  return {
    db,
    controllers: { authController, currencyController, offerController, adminUserController },
    middlewares: { requireAuth },
    integrations: { exchangeRateProvider, emailProvider },
  };
}

export type Container = ReturnType<typeof buildContainer>;
