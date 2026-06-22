import { afterEach, describe, expect, it } from 'bun:test';
import { ExchangeRateClient } from '../../../../src/infrastructure/integrations/exchangeRate/ExchangeRateClient';
import { IntegrationError } from '../../../../src/infrastructure/integrations/shared/IntegrationError';

const originalFetch = globalThis.fetch;

/** Substitui o fetch global por uma resposta controlada. */
function stubFetch(status: number, body: unknown) {
  globalThis.fetch = (async () =>
    new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json' },
    })) as unknown as typeof fetch;
}

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe('ExchangeRateClient.getReferenceRate', () => {
  it('mapeia a resposta crua do fornecedor para o modelo do domínio', async () => {
    stubFetch(200, { base: 'AOA', target: 'BRL', rate: 0.0012, timestamp: 1_700_000_000 });
    const client = new ExchangeRateClient('https://api.example/', 'key');

    const rate = await client.getReferenceRate('AOA', 'BRL');

    expect(rate.base).toBe('AOA');
    expect(rate.quote).toBe('BRL');
    expect(rate.rate).toBe(0.0012);
    expect(rate.fetchedAt).toBe(new Date(1_700_000_000 * 1000).toISOString());
  });

  it('lança IntegrationError quando o fornecedor responde com erro', async () => {
    stubFetch(500, { message: 'indisponível' });
    const client = new ExchangeRateClient('https://api.example/', 'key');

    await expect(client.getReferenceRate('AOA', 'BRL')).rejects.toBeInstanceOf(IntegrationError);
  });
});
