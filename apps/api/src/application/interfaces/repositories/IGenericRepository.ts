/**
 * Contrato genérico de acesso a dados. Os repositórios específicos estendem-no e
 * acrescentam métodos próprios. A implementação concreta vive na infrastructure
 * (`DrizzleGenericRepository`).
 *
 * `TEntity` é a entidade de domínio; `TInsert` o objeto necessário para a criar.
 */
export interface IGenericRepository<
  TEntity,
  TInsert = Omit<TEntity, 'id' | 'createdAt' | 'updatedAt'>,
> {
  findById(id: string): Promise<TEntity | null>;
  findAll(): Promise<TEntity[]>;
  create(data: TInsert): Promise<TEntity>;
  update(id: string, data: Partial<TInsert>): Promise<TEntity | null>;
  delete(id: string): Promise<boolean>;
}
