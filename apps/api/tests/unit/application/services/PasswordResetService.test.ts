import { describe, expect, it } from 'bun:test';
import { PasswordResetService } from '../../../../src/application/services/PasswordResetService';
import type { User } from '../../../../src/domain/entities/User';
import { FakeEmailProvider } from '../../../helpers/fakes/FakeEmailProvider';
import { FakePasswordHasher } from '../../../helpers/fakes/FakePasswordHasher';
import { FakePasswordResetTokenRepository } from '../../../helpers/fakes/FakePasswordResetTokenRepository';
import { FakeUserRepository } from '../../../helpers/fakes/FakeUserRepository';
import { FakeVerificationTokenFactory } from '../../../helpers/fakes/FakeVerificationTokenFactory';

function makeService() {
  const users = new FakeUserRepository();
  const resetTokens = new FakePasswordResetTokenRepository();
  const factory = new FakeVerificationTokenFactory();
  const email = new FakeEmailProvider();
  const hasher = new FakePasswordHasher();
  const service = new PasswordResetService(users, resetTokens, factory, email, hasher, {
    tokenTtlSeconds: 3600,
    webAppUrl: 'http://localhost:5173',
  });
  return { service, users, resetTokens, factory, email, hasher };
}

async function seedUser(users: FakeUserRepository): Promise<User> {
  return users.create({
    name: 'Rui',
    email: 'rui@x.com',
    passwordHash: 'hashed:antiga',
    roles: ['user'],
    emailConfirmedAt: new Date(),
    tokenVersion: 0,
    disabledAt: null,
  });
}

describe('PasswordResetService.request', () => {
  it('para email inexistente responde genérico sem gravar token nem enviar', async () => {
    const { service, resetTokens, email } = makeService();
    const result = await service.request({ email: 'ninguem@x.com' });
    expect(result.succeeded).toBe(true);
    expect([...resetTokens.store.values()]).toHaveLength(0);
    expect(email.sent).toHaveLength(0);
  });

  it('para email existente grava o token e envia o link no fragmento', async () => {
    const { service, users, resetTokens, email } = makeService();
    await seedUser(users);

    await service.request({ email: 'rui@x.com' });

    const stored = [...resetTokens.store.values()];
    expect(stored).toHaveLength(1);
    expect(stored[0]?.tokenHash).toBe('hashed:token-abc');
    expect(email.sent[0]?.html).toContain('/reset-password#token=token-abc');
  });
});

describe('PasswordResetService.validateToken', () => {
  it('token válido → ok; token inexistente → 403', async () => {
    const { service, users } = makeService();
    await seedUser(users);
    await service.request({ email: 'rui@x.com' });

    expect((await service.validateToken({ token: 'token-abc' })).succeeded).toBe(true);

    const invalid = await service.validateToken({ token: 'desconhecido' });
    expect(invalid.succeeded).toBe(false);
    expect(invalid.statusCode).toBe(403);
    expect(invalid.code).toBe('INVALID_OR_EXPIRED_TOKEN');
  });
});

describe('PasswordResetService.reset', () => {
  it('redefine a password e consome o token (uso único)', async () => {
    const { service, users, hasher } = makeService();
    const user = await seedUser(users);
    await service.request({ email: 'rui@x.com' });

    const first = await service.reset({ token: 'token-abc', password: 'novaSenha' });
    const second = await service.reset({ token: 'token-abc', password: 'outraSenha' });

    expect(first.succeeded).toBe(true);
    expect((await users.findById(user.id))?.passwordHash).toBe(await hasher.hash('novaSenha'));
    expect(second.succeeded).toBe(false);
    expect(second.statusCode).toBe(403);
  });

  it('token inválido → 403 e password inalterada', async () => {
    const { service, users } = makeService();
    const user = await seedUser(users);

    const result = await service.reset({ token: 'inexistente', password: 'x' });

    expect(result.succeeded).toBe(false);
    expect((await users.findById(user.id))?.passwordHash).toBe('hashed:antiga');
  });
});

describe('PasswordResetService.requestForUser (admin)', () => {
  it('utilizador existente: grava token e envia email', async () => {
    const { service, users, resetTokens, email } = makeService();
    const user = await seedUser(users);

    const result = await service.requestForUser(user.id);

    expect(result.succeeded).toBe(true);
    expect([...resetTokens.store.values()]).toHaveLength(1);
    expect(email.sent[0]?.to).toBe('rui@x.com');
  });

  it('utilizador inexistente → 404, sem token nem email', async () => {
    const { service, resetTokens, email } = makeService();

    const result = await service.requestForUser('nao-existe');

    expect(result.succeeded).toBe(false);
    expect(result.statusCode).toBe(404);
    expect([...resetTokens.store.values()]).toHaveLength(0);
    expect(email.sent).toHaveLength(0);
  });
});
