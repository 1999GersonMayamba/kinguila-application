import type { Currency } from '../../../domain/entities/Currency';
import type { CurrencyCode } from '../../../domain/enums/CurrencyCode';

/** Campos editáveis de uma moeda (o `code` é imutável — é a PK). */
export type CurrencyUpdate = Partial<Pick<Currency, 'name' | 'symbol' | 'icon'>>;

export interface ICurrencyRepository {
  findAllEnabled(): Promise<Currency[]>;
  /** Todas as moedas, incluindo as desativadas (gestão). */
  findAll(): Promise<Currency[]>;
  findByCode(code: CurrencyCode): Promise<Currency | null>;
  /** Atualiza campos editáveis; devolve a moeda atualizada ou null se não existir. */
  update(code: CurrencyCode, data: CurrencyUpdate): Promise<Currency | null>;
  /** Ativa/desativa (soft-delete); devolve a moeda atualizada ou null se não existir. */
  setEnabled(code: CurrencyCode, enabled: boolean): Promise<Currency | null>;
}
