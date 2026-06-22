import type { User } from '../../../domain/entities/User';
import type { IGenericRepository } from './IGenericRepository';

export type UserInsert = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;

export interface IUserRepository extends IGenericRepository<User, UserInsert> {
  findByEmail(email: string): Promise<User | null>;
}
