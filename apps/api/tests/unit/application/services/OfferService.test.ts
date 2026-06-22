import { describe, expect, it } from 'bun:test';
import type { CreateOfferRequest } from '@kinguila/contracts';
import { OfferService } from '../../../../src/application/services/OfferService';
import { FakeCurrencyRepository } from '../../../helpers/fakes/FakeCurrencyRepository';
import { FakeOfferRepository } from '../../../helpers/fakes/FakeOfferRepository';

function makeService() {
  const offers = new FakeOfferRepository();
  const currencies = new FakeCurrencyRepository();
  return { service: new OfferService(offers, currencies), offers, currencies };
}

function makeRequest(overrides: Partial<CreateOfferRequest> = {}): CreateOfferRequest {
  return {
    sellCurrency: 'AOA',
    buyCurrency: 'BRL',
    exchangeRate: 0.0012,
    availableAmount: 1_000_000,
    ...overrides,
  };
}

describe('OfferService.create', () => {
  it('cria uma oferta válida com estado active', async () => {
    const { service } = makeService();
    const result = await service.create(makeRequest(), 'seller-1');

    expect(result.succeeded).toBe(true);
    expect(result.data?.status).toBe('active');
    expect(result.data?.sellerId).toBe('seller-1');
  });

  it('rejeita quando as moedas são iguais', async () => {
    const { service } = makeService();
    const result = await service.create(makeRequest({ buyCurrency: 'AOA' }), 'seller-1');

    expect(result.succeeded).toBe(false);
    expect(result.statusCode).toBe(400);
  });

  it('rejeita taxa não positiva', async () => {
    const { service } = makeService();
    const result = await service.create(makeRequest({ exchangeRate: 0 }), 'seller-1');

    expect(result.succeeded).toBe(false);
  });

  it('rejeita par com moeda desativada', async () => {
    const { service, currencies } = makeService();
    currencies.disable('BRL');
    const result = await service.create(makeRequest(), 'seller-1');

    expect(result.succeeded).toBe(false);
  });
});

describe('OfferService.update', () => {
  it('impede que outro utilizador altere a oferta', async () => {
    const { service } = makeService();
    const created = await service.create(makeRequest(), 'seller-1');
    const id = created.data?.id ?? '';

    const result = await service.update(id, { exchangeRate: 0.002 }, 'intruder');

    expect(result.succeeded).toBe(false);
    expect(result.statusCode).toBe(403);
  });
});
