---
name: add-frontend-feature
description: Passos para criar uma feature nova no front-end Vue (apps/web) do Kinguila seguindo a arquitetura por feature — views, componentes, composables, serviço de API e rotas. Usar sempre que for preciso um ecrã/fluxo novo no front-end.
---

# Criar uma feature no front-end (Vue 3)

Estrutura por **feature**: tudo o que só interessa à feature vive dentro dela. Usa
`features/auth` e `features/offers` como referência. Substitui `foo` pelo nome real.

> Caminhos relativos a `apps/web/src/`.

## 1. Pasta da feature
Cria `features/foo/` com as subpastas necessárias:
```
features/foo/
├── views/         # páginas roteadas (FooListView.vue, FooDetailView.vue)
├── components/    # componentes só desta feature (FooCard.vue)
├── composables/   # lógica reativa (useFoos.ts)
├── services/      # chamadas à API (fooService.ts)
├── stores/        # store Pinia (foo.store.ts) — só se precisar de estado partilhado
└── routes.ts      # rotas desta feature
```

## 2. Serviço de API
- `services/fooService.ts` usa o `httpClient` partilhado (`shared/api/httpClient.ts`) e os
  caminhos de `shared/api/apiRoutes.ts`.
- Tipos de request/response vêm de **`@kinguila/contracts`** — não redefinir à mão.

## 3. Composable
- `composables/useFoos.ts` encapsula estado reativo (loading, erro, dados) e chama o
  serviço. As views não chamam o serviço diretamente quando há lógica reutilizável.

## 4. Views e componentes
- Views em `views/` (sufixo `*View.vue`), pequenas; delegam UI em `components/` e em
  componentes genéricos de `shared/components/`.
- Mantém os `.vue` curtos: extrai componentes filhos/composables quando crescerem.

## 5. Rotas
- Define as rotas em `features/foo/routes.ts` e agrega-as em `router/index.ts`.
- Usa `meta: { requiresAuth: true }` quando precisar de sessão.

## 6. Responsividade (telemóvel vs PC)
- **CSS-first, mobile-first por omissão:** um só template, estilos base = telemóvel,
  `@media (min-width: …)` adiciona o layout de ecrãs maiores. A maioria das diferenças
  telemóvel/PC do Figma são o mesmo layout reorganizado — resolve-se em CSS.
- **Escape hatch só quando a estrutura diverge mesmo** (ex.: nav de topo vs barra inferior):
  ramifica só esse pedaço com `v-if` alimentado por `useBreakpoints`
  (`shared/composables/useBreakpoints.ts`).
- **Breakpoints** vêm de `shared/breakpoints.ts` (corte principal `md` = 768px). Nunca
  inventes deteção de dispositivo própria. Detalhe em `docs/frontend-architecture.md` §6.

## 7. Validar
```bash
bun run --cwd apps/web typecheck
bun run lint
```

## Checklist
- [ ] Pasta `features/foo/` com subpastas
- [ ] `fooService.ts` sobre o `httpClient` e tipos de `@kinguila/contracts`
- [ ] Composable com estado reativo
- [ ] Views + componentes pequenos e focados
- [ ] Rotas agregadas no `router/index.ts`
- [ ] Responsividade: CSS-first mobile-first; `useBreakpoints` só onde a estrutura diverge
- [ ] `typecheck` + `lint` ok
