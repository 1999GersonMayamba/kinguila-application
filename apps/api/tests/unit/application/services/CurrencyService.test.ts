import { describe, expect, it } from 'bun:test';
import { CurrencyService } from '../../../../src/application/services/CurrencyService';
import { FakeCurrencyRepository } from '../../../helpers/fakes/FakeCurrencyRepository';

function makeService() {
  const repo = new FakeCurrencyRepository();
  repo.seed({ code: 'BRL', name: 'Real brasileiro', symbol: 'R$', icon: null, enabled: true });
  repo.seed({ code: 'USD', name: 'Dólar americano', symbol: '$', icon: null, enabled: true });
  return { service: new CurrencyService(repo), repo };
}

describe('CurrencyService.listEnabled / listAll', () => {
  it('listEnabled devolve só ativas; listAll devolve todas', async () => {
    const { service, repo } = makeService();
    repo.seed({ code: 'EUR', name: 'Euro', symbol: '€', icon: null, enabled: false });

    const enabled = await service.listEnabled();
    const all = await service.listAll();

    expect(enabled.data?.map((c) => c.code).sort()).toEqual(['BRL', 'USD']);
    expect(all.data).toHaveLength(3);
  });
});

describe('CurrencyService.update', () => {
  it('atualiza nome/símbolo/ícone de uma moeda existente', async () => {
    const { service } = makeService();
    const result = await service.update('BRL', { name: 'Real', icon: 'flag-br' });
    expect(result.succeeded).toBe(true);
    expect(result.data?.name).toBe('Real');
    expect(result.data?.icon).toBe('flag-br');
  });

  it('código inexistente → 404', async () => {
    const { service, repo } = makeService();
    repo.store.delete('USD');
    const result = await service.update('USD', { name: 'X' });
    expect(result.succeeded).toBe(false);
    expect(result.statusCode).toBe(404);
  });
});

describe('CurrencyService.setEnabled', () => {
  it('desativa: sai de listEnabled mas permanece em listAll; reativa', async () => {
    const { service } = makeService();

    await service.setEnabled('USD', false);
    expect((await service.listEnabled()).data?.map((c) => c.code)).toEqual(['BRL']);
    expect((await service.listAll()).data).toHaveLength(2);

    const reactivated = await service.setEnabled('USD', true);
    expect(reactivated.data?.enabled).toBe(true);
  });
});

describe('CurrencyService.getByCode', () => {
  it('código não semeado → 404', async () => {
    const { service } = makeService(); // semeia BRL e USD, não EUR
    const result = await service.getByCode('EUR');
    expect(result.succeeded).toBe(false);
    expect(result.statusCode).toBe(404);
  });
});
