import type { CurrencyCode } from '../enums/CurrencyCode';
import type { OfferStatus } from '../enums/OfferStatus';

/**
 * Anúncio de um vendedor: disponibiliza `sellCurrency` a uma taxa, recebendo
 * `buyCurrency`. É a referência viva do padrão de entidade (ver skill add-entity).
 */
export interface Offer {
  id: string;
  sellerId: string;
  sellCurrency: CurrencyCode;
  buyCurrency: CurrencyCode;
  /** Unidades de buyCurrency por 1 unidade de sellCurrency. */
  exchangeRate: number;
  /** Montante disponível, na moeda vendida. */
  availableAmount: number;
  status: OfferStatus;
  createdAt: Date;
  updatedAt: Date;
}
