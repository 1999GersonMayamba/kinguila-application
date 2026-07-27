/**
 * Dados estáticos do marketplace (do Figma) — usados enquanto a UI não está ligada
 * à API. A forma `MarketplaceOffer` é intencionalmente mais rica que `OfferResponse`
 * (trader, rating, métodos de pagamento): quando ligarmos à API, mapeamos o que houver
 * e o resto virá de outras fontes (perfil/trader, reputação).
 */

export interface MarketplaceTrader {
  name: string;
  /** Iniciais mostradas no avatar. */
  avatar: string;
  rating: number;
  trades: number;
  verified: boolean;
  online: boolean;
  /** Percentagem de conclusão (0–100). */
  completionRate: number;
}

export interface MarketplaceOffer {
  id: string;
  /** Lado do anúncio: `sell` = o trader vende `currency`; `buy` = o trader compra `currency`. */
  type: 'buy' | 'sell';
  /** Moeda de origem (a que o trader disponibiliza/procura). */
  currency: string;
  /** Moeda de destino. */
  targetCurrency: string;
  rate: number;
  /** Valor mínimo da operação, em `currency`. */
  minAmount: number;
  /** Montante disponível, em `currency`. */
  available: number;
  paymentMethods: string[];
  trader: MarketplaceTrader;
}

/** Emoji de bandeira por código de moeda. */
export const FLAG_EMOJI: Record<string, string> = {
  AOA: '🇦🇴',
  BRL: '🇧🇷',
  USD: '🇺🇸',
  EUR: '🇪🇺',
};

/** Filtros de moeda (o primeiro é o "sem filtro"). */
export const CURRENCY_FILTERS = ['Todos', 'AOA', 'BRL', 'USD', 'EUR'] as const;

/** Métricas do topo (estáticas por agora). */
export const MARKETPLACE_METRICS = [
  { label: 'Traders activos', value: '1.247' },
  { label: 'Volume 24h', value: 'R$ 2,1M' },
  { label: 'Conclusão', value: '98,4%' },
] as const;

export const MOCK_OFFERS: MarketplaceOffer[] = [
  {
    id: '1',
    type: 'sell',
    currency: 'AOA',
    targetCurrency: 'BRL',
    rate: 0.0118,
    minAmount: 10000,
    available: 850000,
    paymentMethods: ['PIX', 'TED'],
    trader: {
      name: 'Carlos M.',
      avatar: 'CM',
      rating: 4.9,
      trades: 342,
      verified: true,
      online: true,
      completionRate: 98.7,
    },
  },
  {
    id: '2',
    type: 'buy',
    currency: 'AOA',
    targetCurrency: 'BRL',
    rate: 0.0116,
    minAmount: 50000,
    available: 5000000,
    paymentMethods: ['PIX'],
    trader: {
      name: 'Trader Kinguila',
      avatar: 'TK',
      rating: 5.0,
      trades: 1204,
      verified: true,
      online: true,
      completionRate: 99.9,
    },
  },
  {
    id: '3',
    type: 'sell',
    currency: 'BRL',
    targetCurrency: 'AOA',
    rate: 85.2,
    minAmount: 200,
    available: 15000,
    paymentMethods: ['PIX', 'Multicaixa'],
    trader: {
      name: 'Fernanda L.',
      avatar: 'FL',
      rating: 4.8,
      trades: 187,
      verified: true,
      online: false,
      completionRate: 96.5,
    },
  },
  {
    id: '4',
    type: 'sell',
    currency: 'AOA',
    targetCurrency: 'BRL',
    rate: 0.0117,
    minAmount: 20000,
    available: 1200000,
    paymentMethods: ['Multicaixa', 'Transferência', 'PIX'],
    trader: {
      name: 'João A.',
      avatar: 'JA',
      rating: 4.7,
      trades: 231,
      verified: true,
      online: true,
      completionRate: 97.3,
    },
  },
  {
    id: '5',
    type: 'buy',
    currency: 'BRL',
    targetCurrency: 'AOA',
    rate: 86.5,
    minAmount: 500,
    available: 20000,
    paymentMethods: ['PIX', 'TED', 'Multicaixa'],
    trader: {
      name: 'Roberto S.',
      avatar: 'RS',
      rating: 4.6,
      trades: 155,
      verified: true,
      online: false,
      completionRate: 94.5,
    },
  },
  {
    id: '6',
    type: 'sell',
    currency: 'AOA',
    targetCurrency: 'BRL',
    rate: 0.0119,
    minAmount: 30000,
    available: 900000,
    paymentMethods: ['PIX'],
    trader: {
      name: 'Ana C.',
      avatar: 'AC',
      rating: 4.95,
      trades: 278,
      verified: true,
      online: true,
      completionRate: 99.1,
    },
  },
];
