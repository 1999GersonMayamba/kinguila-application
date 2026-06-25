import type { AdminUserResponse, ListUsersQuery, UpdateUserRequest } from '@kinguila/contracts';
import type { User } from '../../domain/entities/User';
import type { PagedResult } from '../common/PagedResult';
import { paged } from '../common/PagedResult';
import { Response } from '../common/Response';
import type { IUserRepository } from '../interfaces/repositories/IUserRepository';
import type { IAdminUserService } from '../interfaces/services/IAdminUserService';
import type { IPasswordResetService } from '../interfaces/services/IPasswordResetService';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

/** Administração de utilizadores: listar, editar, desativar/reativar, reset de senha. */
export class AdminUserService implements IAdminUserService {
  constructor(
    private readonly users: IUserRepository,
    private readonly passwordReset: IPasswordResetService,
  ) {}

  async list(query: ListUsersQuery): Promise<Response<PagedResult<AdminUserResponse>>> {
    const page = Math.max(query.page ?? DEFAULT_PAGE, 1);
    const pageSize = Math.min(query.pageSize ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);

    const { items, total } = await this.users.listPaged({
      name: query.name,
      email: query.email,
      role: query.role,
      page,
      pageSize,
    });

    return Response.ok(paged(items.map(this.toResponse), total, page, pageSize));
  }

  async getById(id: string): Promise<Response<AdminUserResponse>> {
    const user = await this.users.findById(id);
    if (!user) {
      return Response.notFound('Utilizador não encontrado.');
    }
    return Response.ok(this.toResponse(user));
  }

  async update(id: string, request: UpdateUserRequest): Promise<Response<AdminUserResponse>> {
    const user = await this.users.findById(id);
    if (!user) {
      return Response.notFound('Utilizador não encontrado.');
    }
    // Apenas o nome é editável nesta fase (roles/password ficam de fora — KTD14).
    const updated = await this.users.update(id, { name: request.name?.trim() });
    return Response.ok(this.toResponse(updated ?? user), 'Utilizador atualizado.');
  }

  async setDisabled(id: string, disabled: boolean): Promise<Response<AdminUserResponse>> {
    const user = await this.users.findById(id);
    if (!user) {
      return Response.notFound('Utilizador não encontrado.');
    }

    // Ao desativar: marca `disabledAt` e incrementa `tokenVersion` (termina sessões)
    // na mesma atualização. Ao reativar: limpa `disabledAt` SEM mexer no tokenVersion.
    const updated = disabled
      ? await this.users.update(id, {
          disabledAt: new Date(),
          tokenVersion: user.tokenVersion + 1,
        })
      : await this.users.update(id, { disabledAt: null });

    return Response.ok(
      this.toResponse(updated ?? user),
      disabled ? 'Conta desativada.' : 'Conta reativada.',
    );
  }

  async resetPassword(id: string): Promise<Response<null>> {
    return this.passwordReset.requestForUser(id);
  }

  /** Allowlist explícito: nunca expõe `passwordHash`/`tokenVersion`. */
  private toResponse(user: User): AdminUserResponse {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles,
      emailConfirmedAt: user.emailConfirmedAt?.toISOString() ?? null,
      disabledAt: user.disabledAt?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
