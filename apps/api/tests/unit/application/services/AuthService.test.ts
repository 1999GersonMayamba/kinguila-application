import { describe, expect, it } from 'bun:test';
import type { AuthResponse } from '@kinguila/contracts';
import { Response } from '../../../../src/application/common/Response';
import type { IEmailVerificationService } from '../../../../src/application/interfaces/services/IEmailVerificationService';
import { AuthService } from '../../../../src/application/services/AuthService';
import { FakePasswordHasher } from '../../../helpers/fakes/FakePasswordHasher';
import { FakeTokenService } from '../../../helpers/fakes/FakeTokenService';
import { FakeUserRepository } from '../../../helpers/fakes/FakeUserRepository';

/** Stub do serviço de verificação: o AuthService só usa `sendCode`. */
class StubEmailVerificationService implements IEmailVerificationService {
  sendCodeCalls = 0;
  shouldFail = false;

  async sendCode(): Promise<void> {
    this.sendCodeCalls += 1;
    if (this.shouldFail) throw new Error('email indisponível');
  }

  async confirm(): Promise<Response<AuthResponse>> {
    return Response.fail('n/a');
  }

  async resend(): Promise<Response<null>> {
    return Response.ok(null);
  }
}

function makeService() {
  const users = new FakeUserRepository();
  const hasher = new FakePasswordHasher();
  const tokens = new FakeTokenService();
  const emailVerification = new StubEmailVerificationService();
  const service = new AuthService(users, hasher, tokens, emailVerification);
  return { service, users, hasher, tokens, emailVerification };
}

describe('AuthService.register', () => {
  it('cria conta por confirmar, sem tokens, e dispara o envio do código', async () => {
    const { service, users, emailVerification } = makeService();

    const result = await service.register({
      name: 'Ana',
      email: 'Ana@x.com',
      password: 'segredo12',
    });

    expect(result.succeeded).toBe(true);
    expect(result.statusCode).toBe(201);
    expect(result.data?.verificationRequired).toBe(true);
    // A resposta de registo não contém tokens.
    expect(result.data).not.toHaveProperty('tokens');
    const user = await users.findByEmail('ana@x.com');
    expect(user?.emailConfirmedAt).toBeNull();
    expect(emailVerification.sendCodeCalls).toBe(1);
  });

  it('rejeita email já registado com 409', async () => {
    const { service } = makeService();
    await service.register({ name: 'Ana', email: 'ana@x.com', password: 'segredo12' });

    const result = await service.register({
      name: 'Outra',
      email: 'ana@x.com',
      password: 'segredo12',
    });

    expect(result.succeeded).toBe(false);
    expect(result.statusCode).toBe(409);
  });

  it('se o envio de email falhar, o registo continua (não-fatal)', async () => {
    const { service, users, emailVerification } = makeService();
    emailVerification.shouldFail = true;

    const result = await service.register({
      name: 'Ana',
      email: 'ana@x.com',
      password: 'segredo12',
    });

    expect(result.succeeded).toBe(true);
    expect(await users.findByEmail('ana@x.com')).not.toBeNull();
  });
});

describe('AuthService.login', () => {
  it('recusa conta não confirmada com 403 ACCOUNT_NOT_CONFIRMED', async () => {
    const { service, users } = makeService();
    await users.create({
      name: 'Ana',
      email: 'ana@x.com',
      passwordHash: 'hashed:segredo12',
      roles: ['user'],
      emailConfirmedAt: null,
      tokenVersion: 0,
      disabledAt: null,
    });

    const result = await service.login({ email: 'ana@x.com', password: 'segredo12' });

    expect(result.succeeded).toBe(false);
    expect(result.statusCode).toBe(403);
    expect(result.code).toBe('ACCOUNT_NOT_CONFIRMED');
  });

  it('autentica conta confirmada com credenciais válidas', async () => {
    const { service, users } = makeService();
    await users.create({
      name: 'Ana',
      email: 'ana@x.com',
      passwordHash: 'hashed:segredo12',
      roles: ['user'],
      emailConfirmedAt: new Date(),
      tokenVersion: 0,
      disabledAt: null,
    });

    const result = await service.login({ email: 'ana@x.com', password: 'segredo12' });

    expect(result.succeeded).toBe(true);
    expect(result.data?.tokens.accessToken).toBe('access-token');
  });

  it('rejeita credenciais inválidas com 401', async () => {
    const { service, users } = makeService();
    await users.create({
      name: 'Ana',
      email: 'ana@x.com',
      passwordHash: 'hashed:segredo12',
      roles: ['user'],
      emailConfirmedAt: new Date(),
      tokenVersion: 0,
      disabledAt: null,
    });

    const result = await service.login({ email: 'ana@x.com', password: 'errada' });

    expect(result.succeeded).toBe(false);
    expect(result.statusCode).toBe(401);
  });
});

describe('AuthService.refresh', () => {
  it('renova a sessão com refresh válido e tokenVersion coincidente', async () => {
    const { service, users, tokens } = makeService();
    const user = await users.create({
      name: 'Ana',
      email: 'ana@x.com',
      passwordHash: 'hashed:x',
      roles: ['user'],
      emailConfirmedAt: new Date(),
      tokenVersion: 0,
      disabledAt: null,
    });
    tokens.refreshResult = { sub: user.id, tokenVersion: 0 };

    const result = await service.refresh({ refreshToken: 'qualquer' });

    expect(result.succeeded).toBe(true);
    expect(result.data?.tokens.accessToken).toBe('access-token');
  });

  it('rejeita refresh token inválido com 401', async () => {
    const { service, tokens } = makeService();
    tokens.refreshResult = null;

    const result = await service.refresh({ refreshToken: 'qualquer' });

    expect(result.succeeded).toBe(false);
    expect(result.statusCode).toBe(401);
    expect(result.code).toBe('INVALID_REFRESH_TOKEN');
  });

  it('rejeita refresh com tokenVersion desatualizado (revogado por logout)', async () => {
    const { service, users, tokens } = makeService();
    const user = await users.create({
      name: 'Ana',
      email: 'ana@x.com',
      passwordHash: 'hashed:x',
      roles: ['user'],
      emailConfirmedAt: new Date(),
      tokenVersion: 1,
      disabledAt: null,
    });
    tokens.refreshResult = { sub: user.id, tokenVersion: 0 }; // versão antiga

    const result = await service.refresh({ refreshToken: 'qualquer' });

    expect(result.succeeded).toBe(false);
    expect(result.statusCode).toBe(401);
  });
});

describe('AuthService.logout', () => {
  it('incrementa o tokenVersion, invalidando os tokens existentes', async () => {
    const { service, users } = makeService();
    const user = await users.create({
      name: 'Ana',
      email: 'ana@x.com',
      passwordHash: 'hashed:x',
      roles: ['user'],
      emailConfirmedAt: new Date(),
      tokenVersion: 0,
      disabledAt: null,
    });

    const result = await service.logout(user.id);

    expect(result.succeeded).toBe(true);
    expect((await users.findById(user.id))?.tokenVersion).toBe(1);
  });
});
