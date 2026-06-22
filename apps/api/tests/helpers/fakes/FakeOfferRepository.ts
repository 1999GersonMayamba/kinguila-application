import type {
  IOfferRepository,
  OfferInsert,
} from '../../../src/application/interfaces/repositories/IOfferRepository';
import type { Offer } from '../../../src/domain/entities/Offer';

/** Fake em memória do repositório de ofertas para testes unitários. */
export class FakeOfferRepository implements IOfferRepository {
  private store = new Map<string, Offer>();
  private seq = 0;

  async listActive(): Promise<{ items: Offer[]; total: number }> {
    const items = [...this.store.values()].filter((offer) => offer.status === 'active');
    return { items, total: items.length };
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
