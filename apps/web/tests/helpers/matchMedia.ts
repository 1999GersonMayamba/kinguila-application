/**
 * Mock de `window.matchMedia` para testes (bun:test não tem DOM).
 *
 * Avalia queries `(min-width: Npx)` contra uma largura simulada e permite mudar essa
 * largura, disparando os eventos `change` registados — tal como um browser faria ao
 * redimensionar a janela.
 */
type ChangeListener = (event: { matches: boolean }) => void;

interface Registered {
  query: string;
  listeners: Set<ChangeListener>;
}

export interface MatchMediaHandle {
  /** Altera a largura simulada e notifica todos os listeners registados. */
  setWidth(next: number): void;
  /** Nº total de listeners `change` ativos (para verificar limpeza). */
  listenerCount(): number;
  /** Remove o mock do global. */
  cleanup(): void;
}

/** Instala o mock em `globalThis.window.matchMedia` e devolve um handle de controlo. */
export function installMatchMedia(initialWidth: number): MatchMediaHandle {
  let width = initialWidth;
  const registry: Registered[] = [];

  const evaluate = (query: string): boolean => {
    const match = query.match(/min-width:\s*(\d+)px/);
    return match ? width >= Number(match[1]) : false;
  };

  const matchMedia = (query: string) => {
    const entry: Registered = { query, listeners: new Set() };
    registry.push(entry);
    return {
      media: query,
      get matches() {
        return evaluate(query);
      },
      addEventListener: (_type: string, cb: ChangeListener) => entry.listeners.add(cb),
      removeEventListener: (_type: string, cb: ChangeListener) => entry.listeners.delete(cb),
    };
  };

  (globalThis as unknown as { window: unknown }).window = { matchMedia };

  return {
    setWidth(next: number) {
      width = next;
      for (const entry of registry) {
        for (const cb of entry.listeners) {
          cb({ matches: evaluate(entry.query) });
        }
      }
    },
    listenerCount() {
      return registry.reduce((total, entry) => total + entry.listeners.size, 0);
    },
    cleanup() {
      registry.length = 0;
      (globalThis as unknown as { window?: unknown }).window = undefined;
    },
  };
}
