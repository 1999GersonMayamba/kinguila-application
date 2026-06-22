import { describe, expect, it } from 'bun:test';
import { EmailVerificationService } from '../../../../src/application/services/EmailVerificationService';
import type { User } from '../../../../src/domain/entities/User';
import { FakeEmailProvider } from '../../../helpers/fakes/FakeEmailProvider';
import { FakeEmailVerificationCodeRepository } from '../../../helpers/fakes/FakeEmailVerificationCodeRepository';
import { FakeTokenService } from '../../../helpers/fakes/FakeTokenService';
import { FakeUserRepository } from '../../../helpers/fakes/FakeUserRepository';
import { FakeVerificationTokenFactory } from '../../../helpers/fakes/FakeVerificationTokenFactory';

function makeService() {
  const users = new FakeUserRepository();
  const codes = new FakeEmailVerificationCodeRepository();
  const factory = new FakeVerificationTokenFactory();
  const email = new FakeEmailProvider();
  const tokens = new FakeTokenService();
  const service = new EmailVerificationService(users, codes, factory, email, tokens, {
    codeTtlSeconds: 900,
    resendRateLimitSeconds: 60,
    maxAttempts: 5,
  });
  return { service, users, codes, factory, email, tokens };
}

async function seedUser(users: FakeUserRepository): Promise<User> {
  return users.create({
    name: 'Ana',
    email: 'ana@x.com',
    passwordHash: 'h',
    roles: ['user'],
    emailConfirmedAt: null,
    tokenVersion: 0,
  });
}

describe('EmailVerificationService.sendCode', () => {
  it('persiste o hash do código (nunca o valor cru) e envia o email', async () => {
    const { service, users, codes, email } = makeService();
    const user = await seedUser(users);

    await service.sendCode(user.id, user.email);

    const stored = [...codes.store.values()];
    expect(stored).toHaveLength(1);
    expect(stored[0]?.codeHash).toBe('hashed:123456');
    expect(stored[0]?.codeHash).not.toBe('123456'); // nunca o valor cru
    expect(email.sent).toHaveLength(1);
    expect(email.sent[0]?.html).toContain('123456');
  });
});

describe('EmailVerificationService.confirm', () => {
  it('confirma a conta e emite tokens com o código correto', async () => {
    const { service, users, tokens } = makeService();
    const user = await seedUser(users);
    await service.sendCode(user.id, user.email);

    const result = await service.confirm({ email: user.email, code: '123456' });

    expect(result.succeeded).toBe(true);
    expect(result.data?.tokens.accessToken).toBe('access-token');
    expect((await users.findById(user.id))?.emailConfirmedAt).not.toBeNull();
    expect(tokens.issuedFor).toHaveLength(1);
  });

  it('rejeita código errado com 403 e incrementa as tentativas', async () => {
    const { service, users, codes } = makeService();
    const user = await seedUser(users);
    await service.sendCode(user.id, user.email);

    const result = await service.confirm({ email: user.email, code: '000000' });

    expect(result.succeeded).toBe(false);
    expect(result.statusCode).toBe(403);
    expect(result.code).toBe('INVALID_OR_EXPIRED_CODE');
    expect([...codes.store.values()][0]?.attemptCount).toBe(1);
  });

  it('bloqueia (lockout) após o limite de tentativas, mesmo com código correto', async () => {
    const { service, users, codes } = makeService();
    const user = await seedUser(users);
    await service.sendCode(user.id, user.email);
    const code = [...codes.store.values()][0];
    if (code) code.attemptCount = 5;

    const result = await service.confirm({ email: user.email, code: '123456' });

    expect(result.succeeded).toBe(false);
    expect(result.code).toBe('CODE_LOCKED_OUT');
  });

  it('consome o código: a segunda confirmação com o mesmo código falha', async () => {
    const { service, users } = makeService();
    const user = await seedUser(users);
    await service.sendCode(user.id, user.email);

    const first = await service.confirm({ email: user.email, code: '123456' });
    const second = await service.confirm({ email: user.email, code: '123456' });

    expect(first.succeeded).toBe(true);
    expect(second.succeeded).toBe(false);
    expect(second.statusCode).toBe(403);
  });

  it('para email inexistente devolve 403 genérico (não revela inexistência)', async () => {
    const { service } = makeService();
    const result = await service.confirm({ email: 'ninguem@x.com', code: '123456' });
    expect(result.succeeded).toBe(false);
    expect(result.code).toBe('INVALID_OR_EXPIRED_CODE');
  });
});

describe('EmailVerificationService.resend', () => {
  it('não reenvia dentro da janela de rate-limit', async () => {
    const { service, users, email } = makeService();
    const user = await seedUser(users);
    await service.sendCode(user.id, user.email);
    expect(email.sent).toHaveLength(1);

    const result = await service.resend({ email: user.email });

    expect(result.succeeded).toBe(true);
    expect(email.sent).toHaveLength(1); // sem novo envio
  });

  it('reenvia fora da janela de rate-limit', async () => {
    const { service, users, codes, email } = makeService();
    const user = await seedUser(users);
    await service.sendCode(user.id, user.email);
    // Envelhece o código existente para sair da janela de 60s.
    const code = [...codes.store.values()][0];
    if (code) code.createdAt = new Date(Date.now() - 120_000);

    await service.resend({ email: user.email });

    expect(email.sent).toHaveLength(2);
  });

  it('para email inexistente responde genérico sem chamar o provider', async () => {
    const { service, email } = makeService();
    const result = await service.resend({ email: 'ninguem@x.com' });
    expect(result.succeeded).toBe(true);
    expect(email.sent).toHaveLength(0);
  });
});
