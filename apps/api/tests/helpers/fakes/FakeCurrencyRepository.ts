import type {
  CurrencyUpdate,
  ICurrencyRepository,
} from '../../../src/application/interfaces/repositories/ICurrencyRepository';
import type { Currency } from '../../../src/domain/entities/Currency';
import type { CurrencyCode } from '../../../src/domain/enums/CurrencyCode';

/**
 * Fake do repositório de moedas para testes unitários. Mantém um store em memória;
 * por omissão as moedas conhecidas são consideradas ativas via `findByCode`.
 */
export class FakeCurrencyRepository implements ICurrencyRepository {
  store = new Map<CurrencyCode, Currency>();
  private readonly disabled = new Set<CurrencyCode>();

  /** Semeia/garante uma moeda no store (para testes de CRUD). */
  seed(currency: Currency): void {
    this.store.set(currency.code, currency);
  }

  disable(code: CurrencyCode): void {
    this.disabled.add(code);
  }

  async findAllEnabled(): Promise<Currency[]> {
    return [...this.store.values()].filter((c) => c.enabled);
  }

  async findAll(): Promise<Currency[]> {
    return [...this.store.values()];
  }

  async findByCode(code: CurrencyCode): Promise<Currency | null> {
    const stored = this.store.get(code);
    if (stored) return stored;
    // Modo "gerido" (store populado): um código não semeado é inexistente.
    if (this.store.size > 0) return null;
    // Compatibilidade com testes de Offer (store vazio): moedas conhecidas ativas.
    return { code, name: code, symbol: code, icon: null, enabled: !this.disabled.has(code) };
  }

  async update(code: CurrencyCode, data: CurrencyUpdate): Promise<Currency | null> {
    const current = this.store.get(code);
    if (!current) return null;
    const updated: Currency = {
      ...current,
      name: data.name ?? current.name,
      symbol: data.symbol ?? current.symbol,
      icon: data.icon === undefined ? current.icon : data.icon,
    };
    this.store.set(code, updated);
    return updated;
  }

  async setEnabled(code: CurrencyCode, enabled: boolean): Promise<Currency | null> {
    const current = this.store.get(code);
    if (!current) return null;
    const updated: Currency = { ...current, enabled };
    this.store.set(code, updated);
    return updated;
  }
}
