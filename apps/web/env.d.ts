/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  // Shim padrão dos SFC Vue (fallback para editores/tsc; vue-tsc tipa os .vue diretamente).
  // biome-ignore lint/complexity/noBannedTypes: assinatura padrão dos SFC Vue.
  // biome-ignore lint/suspicious/noExplicitAny: assinatura padrão dos SFC Vue.
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
