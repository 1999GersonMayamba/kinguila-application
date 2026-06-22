import type { Offer } from '../../../domain/entities/Offer';
import type { CurrencyCode } from '../../../domain/enums/CurrencyCode';
import type { IGenericRepository } from './IGenericRepository';

export type OfferInsert = Omit<Offer, 'id' | 'createdAt' | 'updatedAt'>;

export interface ListActiveFilters {
  sellCurrency?: CurrencyCode;
  buyCurrency?: CurrencyCode;
  page: number;
  pageSize: number;
}

export interface IOfferRepository extends IGenericRepository<Offer, OfferInsert> {
  /** Lista ofertas `active` com filtro por par de moedas e paginação. */
  listActive(filters: ListActiveFilters): Promise<{ items: Offer[]; total: number }>;
}
