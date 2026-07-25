/**
 * Escala de breakpoints do front-end — FONTE DE VERDADE única.
 *
 * As `@media` do CSS não conseguem ler CSS custom properties
 * (`@media (min-width: var(--x))` não funciona) e o projeto não usa pré-processador.
 * Por isso os valores canónicos vivem aqui (consumidos pelo composable `useBreakpoints`)
 * e são espelhados como literais px, documentados, em `shared/styles/tokens.css`.
 * **Manter os dois em sincronia.**
 *
 * Mobile-first: só expomos queries `min-width`. Corte principal telemóvel|PC = `md` (768px);
 * decisões de shell/sidebar usam `lg` (1024px).
 */
export const BREAKPOINTS = {
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

/** Devolve a media query `min-width` de um breakpoint (ex.: `"(min-width: 768px)"`). */
export function minWidthQuery(bp: Breakpoint): string {
  return `(min-width: ${BREAKPOINTS[bp]}px)`;
}
