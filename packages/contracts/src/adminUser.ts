/**
 * Representação de um utilizador para administração. É um **allowlist explícito**:
 * `passwordHash` e `tokenVersion` nunca são expostos.
 */
export interface AdminUserResponse {
  id: string;
  name: string;
  email: string;
  roles: string[];
  emailConfirmedAt: string | null;
  disabledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Filtros + paginação da listagem de utilizadores. */
export interface ListUsersQuery {
  name?: string;
  email?: string;
  role?: string;
  page?: number;
  pageSize?: number;
}

/** Edição por admin: apenas nome nesta fase (NÃO roles nem password). */
export interface UpdateUserRequest {
  name?: string;
}

/** Ativa/desativa uma conta de utilizador. */
export interface SetUserDisabledRequest {
  disabled: boolean;
}
