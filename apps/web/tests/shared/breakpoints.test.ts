import { describe, expect, it } from 'bun:test';
import { BREAKPOINTS, type Breakpoint, minWidthQuery } from '../../src/shared/breakpoints';

describe('breakpoints', () => {
  it('tem as 4 chaves da escala', () => {
    expect(Object.keys(BREAKPOINTS)).toEqual(['sm', 'md', 'lg', 'xl']);
  });

  it('tem valores estritamente crescentes (mobile-first)', () => {
    const values = Object.values(BREAKPOINTS) as number[];
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThan(values[i - 1]);
    }
  });

  it('mantém o corte principal telemóvel|PC em 768px (md)', () => {
    expect(BREAKPOINTS.md).toBe(768);
  });

  it('minWidthQuery devolve a media query min-width correta', () => {
    expect(minWidthQuery('md')).toBe('(min-width: 768px)');
    expect(minWidthQuery('lg')).toBe('(min-width: 1024px)');
  });

  it('minWidthQuery cobre toda a escala', () => {
    const bps: Breakpoint[] = ['sm', 'md', 'lg', 'xl'];
    for (const bp of bps) {
      expect(minWidthQuery(bp)).toBe(`(min-width: ${BREAKPOINTS[bp]}px)`);
    }
  });
});
