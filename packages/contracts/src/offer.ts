import type { CurrencyCode } from './currency';

export type OfferStatus = 'active' | 'paused' | 'completed' | 'cancelled';

export interface CreateOfferRequest {
  /** Moeda que o vendedor disponibiliza (ex.: AOA). */
  sellCurrency: CurrencyCode;
  /** Moeda que o vendedor pretende receber (ex.: BRL). */
  buyCurrency: CurrencyCode;
  /** Taxa: quantas unidades de buyCurrency por 1 unidade de sellCurrency. */
  exchangeRate: number;
  /** Montante disponível, na moeda vendida. */
  availableAmount: number;
}

export interface UpdateOfferRequest {
  exchangeRate?: number;
  availableAmount?: number;
  status?: Extract<OfferStatus, 'active' | 'paused' | 'cancelled'>;
}

export interface OfferResponse {
  id: string;
  sellerId: string;
  sellCurrency: CurrencyCode;
  buyCurrency: CurrencyCode;
  exchangeRate: number;
  availableAmount: number;
  status: OfferStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ListOffersQuery {
  sellCurrency?: CurrencyCode;
  buyCurrency?: CurrencyCode;
  page?: number;
  pageSize?: number;
}
