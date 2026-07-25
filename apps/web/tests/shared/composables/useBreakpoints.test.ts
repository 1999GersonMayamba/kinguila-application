import { afterEach, describe, expect, it } from 'bun:test';
import { effectScope } from 'vue';
import { useBreakpoints } from '../../../src/shared/composables/useBreakpoints';
import { installMatchMedia, type MatchMediaHandle } from '../../helpers/matchMedia';

let mm: MatchMediaHandle | undefined;

afterEach(() => {
  mm?.cleanup();
  mm = undefined;
});

/** Executa o composable dentro de um effectScope para permitir onScopeDispose. */
function runInScope<T>(fn: () => T): { result: T; scope: ReturnType<typeof effectScope> } {
  const scope = effectScope();
  const result = scope.run(fn) as T;
  return { result, scope };
}

describe('useBreakpoints', () => {
  it('reporta telemóvel abaixo de 768px', () => {
    mm = installMatchMedia(500);
    const { result } = runInScope(() => useBreakpoints());
    expect(result.isMobile.value).toBe(true);
    expect(result.isDesktop.value).toBe(false);
  });

  it('reporta desktop a partir de 768px', () => {
    mm = installMatchMedia(1200);
    const { result } = runInScope(() => useBreakpoints());
    expect(result.isMobile.value).toBe(false);
    expect(result.isDesktop.value).toBe(true);
  });

  it('reage ao cruzar o corte dos 768px', () => {
    mm = installMatchMedia(500);
    const { result } = runInScope(() => useBreakpoints());
    expect(result.isMobile.value).toBe(true);

    mm.setWidth(1000);
    expect(result.isMobile.value).toBe(false);
    expect(result.isDesktop.value).toBe(true);
  });

  it('greaterOrEqual respeita o breakpoint pedido', () => {
    mm = installMatchMedia(900);
    const { result } = runInScope(() => useBreakpoints());
    expect(result.greaterOrEqual('lg')).toBe(false); // 900 < 1024

    mm.setWidth(1024);
    expect(result.greaterOrEqual('lg')).toBe(true); // 1024 >= 1024
  });

  it('remove os listeners ao destruir o scope', () => {
    mm = installMatchMedia(500);
    const { result, scope } = runInScope(() => useBreakpoints());
    expect(mm.listenerCount()).toBeGreaterThan(0);

    scope.stop();
    expect(mm.listenerCount()).toBe(0);

    // Após limpeza, mudanças de largura já não afetam o estado.
    mm.setWidth(1200);
    expect(result.isMobile.value).toBe(true);
  });

  it('assume desktop quando window não existe (sem lançar erro)', () => {
    // Sem installMatchMedia -> globalThis.window indefinido.
    const { result } = runInScope(() => useBreakpoints());
    expect(result.isMobile.value).toBe(false);
    expect(result.isDesktop.value).toBe(true);
  });
});
