import type { Currency } from '../../../domain/entities/Currency';
import type { CurrencyCode } from '../../../domain/enums/CurrencyCode';

export interface ICurrencyRepository {
  findAllEnabled(): Promise<Currency[]>;
  findByCode(code: CurrencyCode): Promise<Currency | null>;
}
