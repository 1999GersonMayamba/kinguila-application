import type { User } from '../../../domain/entities/User';
import type { IGenericRepository } from './IGenericRepository';

export type UserInsert = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;

/** Filtros opcionais + paginação para a listagem de administração. */
export interface ListUsersFilters {
  name?: string;
  email?: string;
  role?: string;
  page: number;
  pageSize: number;
}

export interface IUserRepository extends IGenericRepository<User, UserInsert> {
  findByEmail(email: string): Promise<User | null>;
  /** Listagem paginada com filtros, para administração de utilizadores. */
  listPaged(filters: ListUsersFilters): Promise<{ items: User[]; total: number }>;
}
