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
    minimumAmount: 1_000_000,
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
    expect(result.data?.minimumAmount).toBe(1_000_000);
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

  it('rejeita valor mínimo não positivo', async () => {
    const { service } = makeService();
    const result = await service.create(makeRequest({ minimumAmount: 0 }), 'seller-1');

    expect(result.succeeded).toBe(false);
  });

  it('rejeita par com moeda desativada', async () => {
    const { service, currencies } = makeService();
    currencies.disable('BRL');
    const result = await service.create(makeRequest(), 'seller-1');

    expect(result.succeeded).toBe(false);
  });
});

describe('OfferService.list', () => {
  it('lista uma oferta active quando o saldo exposto cobre o mínimo (R9)', async () => {
    const { service, offers } = makeService();
    await service.create(makeRequest({ minimumAmount: 50 }), 'seller-1');
    offers.setListedAmount('seller-1', 'AOA', 80);

    const result = await service.list({});

    expect(result.succeeded).toBe(true);
    expect(result.data?.total).toBe(1);
    expect(result.data?.items).toHaveLength(1);
  });

  it('esconde a oferta quando o saldo exposto é menor que o mínimo (R9)', async () => {
    const { service, offers } = makeService();
    await service.create(makeRequest({ minimumAmount: 100 }), 'seller-1');
    offers.setListedAmount('seller-1', 'AOA', 80);

    const result = await service.list({});

    expect(result.data?.total).toBe(0);
    expect(result.data?.items).toHaveLength(0);
  });

  it('esconde a oferta quando não há saldo exposto registado (R9)', async () => {
    const { service } = makeService();
    await service.create(makeRequest({ minimumAmount: 50 }), 'seller-1');

    const result = await service.list({});

    expect(result.data?.total).toBe(0);
  });

  it('mesma moeda partilha o saldo exposto: só aparecem os mínimos cobertos (AE3, R10)', async () => {
    const { service, offers } = makeService();
    await service.create(makeRequest({ minimumAmount: 50 }), 'seller-1');
    await service.create(makeRequest({ minimumAmount: 100 }), 'seller-1');

    // Com 80 exposto só a oferta de mínimo 50 é visível.
    offers.setListedAmount('seller-1', 'AOA', 80);
    const partial = await service.list({});
    expect(partial.data?.total).toBe(1);
    expect(partial.data?.items[0]?.minimumAmount).toBe(50);

    // Ao subir o saldo exposto para 120 ambas passam a aparecer.
    offers.setListedAmount('seller-1', 'AOA', 120);
    const full = await service.list({});
    expect(full.data?.total).toBe(2);
    expect(full.data?.items.map((o) => o.minimumAmount).sort((a, b) => a - b)).toEqual([50, 100]);
  });

  it('saldo exposto igual a zero esconde todas as ofertas da moeda (AE4)', async () => {
    const { service, offers } = makeService();
    await service.create(makeRequest({ minimumAmount: 50 }), 'seller-1');
    await service.create(makeRequest({ minimumAmount: 100 }), 'seller-1');
    offers.setListedAmount('seller-1', 'AOA', 0);

    const result = await service.list({});

    expect(result.data?.total).toBe(0);
    expect(result.data?.items).toHaveLength(0);
  });

  it('filtro por par devolve apenas as ofertas visíveis desse par (AE5)', async () => {
    const { service, offers } = makeService();
    await service.create(
      makeRequest({ sellCurrency: 'AOA', buyCurrency: 'BRL', minimumAmount: 50 }),
      'seller-1',
    );
    await service.create(
      makeRequest({ sellCurrency: 'USD', buyCurrency: 'EUR', minimumAmount: 50 }),
      'seller-1',
    );
    offers.setListedAmount('seller-1', 'AOA', 80);
    offers.setListedAmount('seller-1', 'USD', 80);

    const result = await service.list({ sellCurrency: 'AOA', buyCurrency: 'BRL' });

    expect(result.data?.total).toBe(1);
    expect(result.data?.items).toHaveLength(1);
    expect(result.data?.items[0]?.sellCurrency).toBe('AOA');
    expect(result.data?.items[0]?.buyCurrency).toBe('BRL');
  });

  it('paginação e total refletem apenas as ofertas visíveis', async () => {
    const { service, offers } = makeService();
    // Três ofertas, mas só duas ficam visíveis (a de mínimo 100 fica escondida).
    await service.create(makeRequest({ minimumAmount: 50 }), 'seller-1');
    await service.create(makeRequest({ minimumAmount: 60 }), 'seller-1');
    await service.create(makeRequest({ minimumAmount: 100 }), 'seller-1');
    offers.setListedAmount('seller-1', 'AOA', 80);

    const firstPage = await service.list({ page: 1, pageSize: 1 });
    expect(firstPage.data?.total).toBe(2);
    expect(firstPage.data?.items).toHaveLength(1);

    const secondPage = await service.list({ page: 2, pageSize: 1 });
    expect(secondPage.data?.total).toBe(2);
    expect(secondPage.data?.items).toHaveLength(1);

    const thirdPage = await service.list({ page: 3, pageSize: 1 });
    expect(thirdPage.data?.items).toHaveLength(0);
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

  it('deixa o dono alterar o valor mínimo', async () => {
    const { service } = makeService();
    const created = await service.create(makeRequest(), 'seller-1');
    const id = created.data?.id ?? '';

    const result = await service.update(id, { minimumAmount: 500_000 }, 'seller-1');

    expect(result.succeeded).toBe(true);
    expect(result.data?.minimumAmount).toBe(500_000);
  });

  it('rejeita valor mínimo não positivo na atualização', async () => {
    const { service } = makeService();
    const created = await service.create(makeRequest(), 'seller-1');
    const id = created.data?.id ?? '';

    const result = await service.update(id, { minimumAmount: 0 }, 'seller-1');

    expect(result.succeeded).toBe(false);
  });
});

describe('OfferService.remove', () => {
  it('impede que outro utilizador remova a oferta', async () => {
    const { service } = makeService();
    const created = await service.create(makeRequest(), 'seller-1');
    const id = created.data?.id ?? '';

    const result = await service.remove(id, 'intruder');

    expect(result.succeeded).toBe(false);
    expect(result.statusCode).toBe(403);
  });

  it('deixa o dono remover a oferta', async () => {
    const { service } = makeService();
    const created = await service.create(makeRequest(), 'seller-1');
    const id = created.data?.id ?? '';

    const result = await service.remove(id, 'seller-1');

    expect(result.succeeded).toBe(true);
  });
});
