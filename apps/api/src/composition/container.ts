import { AuthService } from '../application/services/AuthService';
import { CurrencyService } from '../application/services/CurrencyService';
import { OfferService } from '../application/services/OfferService';
import { env } from '../config/env';
import { createDatabase } from '../infrastructure/database/client';
import { JwtTokenService } from '../infrastructure/identity/JwtTokenService';
import { PasswordHasher } from '../infrastructure/identity/PasswordHasher';
import { ExchangeRateClient } from '../infrastructure/integrations/exchangeRate/ExchangeRateClient';
import { CurrencyRepository } from '../infrastructure/repositories/CurrencyRepository';
import { OfferRepository } from '../infrastructure/repositories/OfferRepository';
import { UserRepository } from '../infrastructure/repositories/UserRepository';
import { AuthController } from '../presentation/http/controllers/AuthController';
import { CurrencyController } from '../presentation/http/controllers/CurrencyController';
import { OfferController } from '../presentation/http/controllers/OfferController';
import { authMiddleware } from '../presentation/http/middlewares/authMiddleware';

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

  // Integrações externas (fornecedores). Injetar nos serviços que as consomem.
  const exchangeRateProvider = new ExchangeRateClient(
    env.EXCHANGE_RATE_API_URL,
    env.EXCHANGE_RATE_API_KEY,
  );

  // Repositórios
  const userRepository = new UserRepository(db);
  const currencyRepository = new CurrencyRepository(db);
  const offerRepository = new OfferRepository(db);

  // Serviços
  const authService = new AuthService(userRepository, passwordHasher, tokenService);
  const currencyService = new CurrencyService(currencyRepository);
  const offerService = new OfferService(offerRepository, currencyRepository);

  // Controllers
  const authController = new AuthController(authService);
  const currencyController = new CurrencyController(currencyService);
  const offerController = new OfferController(offerService);

  // Middleware de autenticação (depende do tokenService)
  const requireAuth = authMiddleware(tokenService);

  return {
    db,
    controllers: { authController, currencyController, offerController },
    middlewares: { requireAuth },
    integrations: { exchangeRateProvider },
  };
}

export type Container = ReturnType<typeof buildContainer>;
