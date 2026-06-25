import { describe, expect, it } from 'bun:test';
import { Response } from '../../../../src/application/common/Response';
import type { IPasswordResetService } from '../../../../src/application/interfaces/services/IPasswordResetService';
import { AdminUserService } from '../../../../src/application/services/AdminUserService';
import type { User } from '../../../../src/domain/entities/User';
import { FakeUserRepository } from '../../../helpers/fakes/FakeUserRepository';

/** Stub do PasswordResetService: regista os ids para os quais foi pedido reset. */
class StubPasswordResetService implements IPasswordResetService {
  resetForUserIds: string[] = [];
  async request(): Promise<Response<null>> {
    return Response.ok(null);
  }
  async validateToken(): Promise<Response<null>> {
    return Response.ok(null);
  }
  async reset(): Promise<Response<null>> {
    return Response.ok(null);
  }
  async requestForUser(userId: string): Promise<Response<null>> {
    this.resetForUserIds.push(userId);
    return Response.ok(null, 'Email enviado.');
  }
}

function makeService() {
  const users = new FakeUserRepository();
  const passwordReset = new StubPasswordResetService();
  const service = new AdminUserService(users, passwordReset);
  return { service, users, passwordReset };
}

async function seedUser(users: FakeUserRepository, overrides: Partial<User> = {}): Promise<User> {
  return users.create({
    name: 'Ana',
    email: `ana${Math.random()}@x.com`,
    passwordHash: 'hashed:x',
    roles: ['client'],
    emailConfirmedAt: new Date(),
    tokenVersion: 0,
    disabledAt: null,
    ...overrides,
  });
}

describe('AdminUserService.list / getById', () => {
  it('lista paginada e filtra por role', async () => {
    const { service, users } = makeService();
    await seedUser(users, { roles: ['client'] });
    await seedUser(users, { roles: ['admin'] });

    const all = await service.list({});
    const admins = await service.list({ role: 'admin' });

    expect(all.data?.total).toBe(2);
    expect(admins.data?.total).toBe(1);
    expect(admins.data?.items[0]?.roles).toContain('admin');
  });

  it('getById inexistente → 404', async () => {
    const { service } = makeService();
    const result = await service.getById('nao-existe');
    expect(result.succeeded).toBe(false);
    expect(result.statusCode).toBe(404);
  });

  it('a resposta nunca inclui passwordHash nem tokenVersion', async () => {
    const { service, users } = makeService();
    const user = await seedUser(users);
    const result = await service.getById(user.id);
    expect(result.data).not.toHaveProperty('passwordHash');
    expect(result.data).not.toHaveProperty('tokenVersion');
  });
});

describe('AdminUserService.update', () => {
  it('altera o nome; não altera passwordHash', async () => {
    const { service, users } = makeService();
    const user = await seedUser(users);
    const result = await service.update(user.id, { name: 'Ana Maria' });
    expect(result.succeeded).toBe(true);
    expect(result.data?.name).toBe('Ana Maria');
    expect((await users.findById(user.id))?.passwordHash).toBe('hashed:x');
  });
});

describe('AdminUserService.setDisabled', () => {
  it('desativa: define disabledAt e incrementa tokenVersion', async () => {
    const { service, users } = makeService();
    const user = await seedUser(users);

    await service.setDisabled(user.id, true);
    const after = await users.findById(user.id);

    expect(after?.disabledAt).not.toBeNull();
    expect(after?.tokenVersion).toBe(1);
  });

  it('reativa: limpa disabledAt e mantém o tokenVersion', async () => {
    const { service, users } = makeService();
    const user = await seedUser(users, { tokenVersion: 3, disabledAt: new Date() });

    await service.setDisabled(user.id, false);
    const after = await users.findById(user.id);

    expect(after?.disabledAt).toBeNull();
    expect(after?.tokenVersion).toBe(3); // não repõe
  });
});

describe('AdminUserService.resetPassword', () => {
  it('delega no PasswordResetService.requestForUser', async () => {
    const { service, users, passwordReset } = makeService();
    const user = await seedUser(users);

    const result = await service.resetPassword(user.id);

    expect(result.succeeded).toBe(true);
    expect(passwordReset.resetForUserIds).toEqual([user.id]);
  });
});
