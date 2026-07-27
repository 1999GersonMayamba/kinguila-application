import { describe, expect, it } from 'bun:test';
import { WalletService } from '../../../../src/application/services/WalletService';
import type { WalletBalance } from '../../../../src/domain/entities/WalletBalance';
import type { CurrencyCode } from '../../../../src/domain/enums/CurrencyCode';
import { FakeWalletRepository } from '../../../helpers/fakes/FakeWalletRepository';

const USER = 'user-1';

function balance(currency: CurrencyCode, amount: number, listed = 0): WalletBalance {
  const now = new Date();
  return {
    id: `${USER}-${currency}`,
    userId: USER,
    currency,
    balance: amount,
    listedAmount: listed,
    createdAt: now,
    updatedAt: now,
  };
}

function makeService() {
  const repo = new FakeWalletRepository();
  repo.seed(balance('BRL', 1000));
  repo.seed(balance('USD', 200, 50));
  return { service: new WalletService(repo), repo };
}

describe('WalletService.getMyWallet', () => {
  it('devolve os saldos do utilizador mapeados', async () => {
    const { service } = makeService();
    const result = await service.getMyWallet(USER);

    expect(result.succeeded).toBe(true);
    expect(result.data).toHaveLength(2);
    const brl = result.data?.find((b) => b.currency === 'BRL');
    expect(brl).toEqual({ currency: 'BRL', balance: 1000, listedAmount: 0 });
  });

  it('utilizador sem saldos devolve lista vazia', async () => {
    const { service } = makeService();
    const result = await service.getMyWallet('sem-saldos');
    expect(result.succeeded).toBe(true);
    expect(result.data).toEqual([]);
  });
});

describe('WalletService.setListedAmount', () => {
  it('amount ≤ balance → ok e persiste', async () => {
    const { service, repo } = makeService();
    const result = await service.setListedAmount(USER, 'BRL', { listedAmount: 600 });

    expect(result.succeeded).toBe(true);
    expect(result.data?.listedAmount).toBe(600);
    const stored = await repo.findByUserAndCurrency(USER, 'BRL');
    expect(stored?.listedAmount).toBe(600);
  });

  it('amount > balance → fail', async () => {
    const { service } = makeService();
    const result = await service.setListedAmount(USER, 'BRL', { listedAmount: 5000 });
    expect(result.succeeded).toBe(false);
    expect(result.message).toBe('Não pode expor mais do que o saldo disponível.');
  });

  it('sem saldo para a moeda → fail', async () => {
    const { service } = makeService();
    const result = await service.setListedAmount(USER, 'EUR', { listedAmount: 10 });
    expect(result.succeeded).toBe(false);
    expect(result.message).toBe('Sem saldo nessa moeda.');
  });

  it('valor negativo → fail', async () => {
    const { service } = makeService();
    const result = await service.setListedAmount(USER, 'BRL', { listedAmount: -1 });
    expect(result.succeeded).toBe(false);
  });

  it('moeda fora de CURRENCY_CODES → fail', async () => {
    const { service } = makeService();
    const result = await service.setListedAmount(USER, 'GBP', { listedAmount: 10 });
    expect(result.succeeded).toBe(false);
    expect(result.message).toBe('Moeda inválida.');
  });
});
