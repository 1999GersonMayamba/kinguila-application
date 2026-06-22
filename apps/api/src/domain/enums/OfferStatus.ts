/** Estados possíveis de uma oferta. Persistidos como texto. */
export const OFFER_STATUSES = ['active', 'paused', 'completed', 'cancelled'] as const;

export type OfferStatus = (typeof OFFER_STATUSES)[number];
