import type {
  IOfferRepository,
  ListActiveFilters,
  OfferInsert,
} from '../../../src/application/interfaces/repositories/IOfferRepository';
import type { Offer } from '../../../src/domain/entities/Offer';

/** Fake em memória do repositório de ofertas para testes unitários. */
export class FakeOfferRepository implements IOfferRepository {
  private store = new Map<string, Offer>();
  private seq = 0;
  /** Saldos expostos (`listedAmount`) por chave `sellerId::currency` (R9/R10). */
  private listedAmounts = new Map<string, number>();

  /** Regista o saldo exposto de um vendedor numa moeda para simular o predicado R9/R10. */
  setListedAmount(sellerId: string, currency: string, amount: number): void {
    this.listedAmounts.set(`${sellerId}::${currency}`, amount);
  }

  async listActive(filters: ListActiveFilters): Promise<{ items: Offer[]; total: number }> {
    // Simula o JOIN de wallet_balances: só é visível se `active` E o saldo
    // exposto do vendedor na moeda de origem for >= ao mínimo da oferta (R9).
    const visible = [...this.store.values()]
      .filter((offer) => offer.status === 'active')
      .filter((offer) => {
        const listed = this.listedAmounts.get(`${offer.sellerId}::${offer.sellCurrency}`);
        return listed !== undefined && listed >= offer.minimumAmount;
      })
      .filter((offer) => !filters.sellCurrency || offer.sellCurrency === filters.sellCurrency)
      .filter((offer) => !filters.buyCurrency || offer.buyCurrency === filters.buyCurrency)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = visible.length;
    const offset = (filters.page - 1) * filters.pageSize;
    const items = visible.slice(offset, offset + filters.pageSize);

    return { items, total };
  }

  async findById(id: string): Promise<Offer | null> {
    return this.store.get(id) ?? null;
  }

  async findAll(): Promise<Offer[]> {
    return [...this.store.values()];
  }

  async create(data: OfferInsert): Promise<Offer> {
    const now = new Date();
    const offer: Offer = { id: `offer-${++this.seq}`, createdAt: now, updatedAt: now, ...data };
    this.store.set(offer.id, offer);
    return offer;
  }

  async update(id: string, data: Partial<OfferInsert>): Promise<Offer | null> {
    const current = this.store.get(id);
    if (!current) return null;
    const updated: Offer = { ...current, ...data, updatedAt: new Date() };
    this.store.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }
}
