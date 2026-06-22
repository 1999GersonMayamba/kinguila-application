import type { ICurrencyRepository } from '../../../src/application/interfaces/repositories/ICurrencyRepository';
import type { Currency } from '../../../src/domain/entities/Currency';
import type { CurrencyCode } from '../../../src/domain/enums/CurrencyCode';

/**
 * Fake do repositório de moedas para testes unitários. Por omissão considera todas
 * as moedas conhecidas como ativas; podem desativar-se via `disable()`.
 */
export class FakeCurrencyRepository implements ICurrencyRepository {
  private readonly disabled = new Set<CurrencyCode>();

  disable(code: CurrencyCode): void {
    this.disabled.add(code);
  }

  async findAllEnabled(): Promise<Currency[]> {
    return [];
  }

  async findByCode(code: CurrencyCode): Promise<Currency | null> {
    return { code, name: code, symbol: code, enabled: !this.disabled.has(code) };
  }
}
