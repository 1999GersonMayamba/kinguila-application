import { afterEach, describe, expect, it } from 'bun:test';
import { ResendClient } from '../../../../src/infrastructure/integrations/email/ResendClient';
import { IntegrationError } from '../../../../src/infrastructure/integrations/shared/IntegrationError';

const originalFetch = globalThis.fetch;
let lastRequest: { url: string; init: RequestInit } | null = null;

function stubFetch(status: number, body: unknown) {
  globalThis.fetch = (async (url: string | URL, init: RequestInit) => {
    lastRequest = { url: String(url), init };
    return new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json' },
    });
  }) as unknown as typeof fetch;
}

afterEach(() => {
  globalThis.fetch = originalFetch;
  lastRequest = null;
});

describe('ResendClient.send', () => {
  it('faz POST a /emails com header de autorização e corpo correto', async () => {
    stubFetch(200, { id: 'email-1' });
    const client = new ResendClient(
      're_key',
      'Kinguila <no-reply@kinguila.app>',
      'https://api.example/',
    );

    await client.send({ to: 'user@x.com', subject: 'Olá', html: '<p>oi</p>' });

    expect(lastRequest?.url).toBe('https://api.example/emails');
    expect(lastRequest?.init.method).toBe('POST');
    const headers = lastRequest?.init.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer re_key');
    const body = JSON.parse(lastRequest?.init.body as string);
    expect(body).toEqual({
      from: 'Kinguila <no-reply@kinguila.app>',
      to: 'user@x.com',
      subject: 'Olá',
      html: '<p>oi</p>',
    });
  });

  it('lança IntegrationError quando a Resend responde com erro', async () => {
    stubFetch(422, { message: 'inválido' });
    const client = new ResendClient('re_key', 'from@x.com', 'https://api.example/');

    await expect(client.send({ to: 'user@x.com', subject: 's', html: 'h' })).rejects.toBeInstanceOf(
      IntegrationError,
    );
  });
});
