import { eq } from 'drizzle-orm';
import type { PgTable } from 'drizzle-orm/pg-core';
import type { IGenericRepository } from '../../application/interfaces/repositories/IGenericRepository';
import type { Database } from '../database/client';

/**
 * Repositório genérico sobre Drizzle. Os repositórios específicos herdam-no e
 * acrescentam queries próprias usando `this.db` e `this.table`.
 *
 * Dois mapeadores ligam o mundo do domínio ao da BD (e tratam conversões como
 * `numeric`↔`number`):
 *  - `mapRow`: linha da BD → entidade de domínio.
 *  - `toRow`:  (parcial de) insert de domínio → (parcial de) linha de inserção.
 */
export abstract class DrizzleGenericRepository<
  TEntity,
  TInsert,
  // biome-ignore lint/suspicious/noExplicitAny: o tipo de tabela do Drizzle exige any no limite genérico.
  TTable extends PgTable = any,
> implements IGenericRepository<TEntity, TInsert>
{
  constructor(
    protected readonly db: Database,
    protected readonly table: TTable,
    protected readonly mapRow: (row: TTable['$inferSelect']) => TEntity,
    protected readonly toRow: (data: Partial<TInsert>) => Partial<TTable['$inferInsert']>,
  ) {}

  protected get idColumn() {
    // Convenção: todas as tabelas com este genérico têm coluna `id`.
    return (this.table as Record<string, unknown>).id as never;
  }

  async findById(id: string): Promise<TEntity | null> {
    const rows = await this.db
      .select()
      .from(this.table as never)
      .where(eq(this.idColumn, id))
      .limit(1);
    const row = rows[0];
    return row ? this.mapRow(row as TTable['$inferSelect']) : null;
  }

  async findAll(): Promise<TEntity[]> {
    const rows = await this.db.select().from(this.table as never);
    return rows.map((row) => this.mapRow(row as TTable['$inferSelect']));
  }

  async create(data: TInsert): Promise<TEntity> {
    const rows = await this.db
      .insert(this.table)
      .values(this.toRow(data as Partial<TInsert>) as never)
      .returning();
    return this.mapRow(rows[0] as TTable['$inferSelect']);
  }

  async update(id: string, data: Partial<TInsert>): Promise<TEntity | null> {
    const rows = await this.db
      .update(this.table)
      .set({ ...this.toRow(data), updatedAt: new Date() } as never)
      .where(eq(this.idColumn, id))
      .returning();
    const row = rows[0];
    return row ? this.mapRow(row as TTable['$inferSelect']) : null;
  }

  async delete(id: string): Promise<boolean> {
    const rows = await this.db.delete(this.table).where(eq(this.idColumn, id)).returning();
    return rows.length > 0;
  }
}
