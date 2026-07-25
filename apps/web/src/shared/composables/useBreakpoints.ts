import { BREAKPOINTS, type Breakpoint, minWidthQuery } from '@/shared/breakpoints';
import { computed, onScopeDispose, readonly, ref } from 'vue';

/**
 * Deteção reativa da viewport, baseada em `window.matchMedia` (mobile-first).
 *
 * - `isMobile`  — largura < `md` (768px)
 * - `isDesktop` — largura >= `md`
 * - `greaterOrEqual(bp)` — `true` quando a largura >= `bp` (ex.: `'lg'` para decisões de shell)
 * - `matches` — mapa reativo (só-leitura) de cada breakpoint
 *
 * Regra do projeto: usa isto **apenas** para o "escape hatch" — ramificar a estrutura do
 * DOM quando o layout diverge mesmo entre telemóvel e PC. Para reorganizações simples,
 * prefere CSS `@media` mobile-first.
 *
 * Seguro quando `window` não existe (pré-render/SSR): assume desktop.
 */
export function useBreakpoints() {
  const bps = Object.keys(BREAKPOINTS) as Breakpoint[];
  const hasWindow = typeof window !== 'undefined' && typeof window.matchMedia === 'function';

  const initial = {} as Record<Breakpoint, boolean>;
  for (const bp of bps) {
    // Sem window: assume desktop (todos os min-width satisfeitos).
    initial[bp] = hasWindow ? window.matchMedia(minWidthQuery(bp)).matches : true;
  }
  const matches = ref<Record<Breakpoint, boolean>>(initial);

  if (hasWindow) {
    const cleanups: Array<() => void> = [];
    for (const bp of bps) {
      const mql = window.matchMedia(minWidthQuery(bp));
      const handler = (event: MediaQueryListEvent) => {
        matches.value = { ...matches.value, [bp]: event.matches };
      };
      mql.addEventListener('change', handler);
      cleanups.push(() => mql.removeEventListener('change', handler));
    }
    onScopeDispose(() => {
      for (const cleanup of cleanups) cleanup();
    });
  }

  const isDesktop = computed(() => matches.value.md);
  const isMobile = computed(() => !matches.value.md);
  const greaterOrEqual = (bp: Breakpoint) => matches.value[bp];

  return { isMobile, isDesktop, greaterOrEqual, matches: readonly(matches) };
}
