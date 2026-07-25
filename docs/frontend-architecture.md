# Arquitetura — Front-end (apps/web)

Front-end em **Vue 3 + Vite + TypeScript**, organizado por **feature** (não por tipo de
ficheiro). Objetivo: responsabilidades claras, ficheiros curtos e fácil de evoluir.

## 1. Stack

- **Vue 3** (Composition API + `<script setup>`).
- **Vite** (build/dev server).
- **Vue Router** (rotas).
- **Pinia** (estado global, quando necessário).
- **TypeScript** estrito em todo o lado.
- **Biome** (lint/format, partilhado com o monorepo).
- Tipos de API importados de **`@kinguila/contracts`** (mesmos DTOs do back-end).

## 2. Estrutura (`apps/web/src/`)

```
src/
├── main.ts                 # bootstrap da app (Vue, Pinia, Router)
├── App.vue                 # shell raiz
├── router/
│   └── index.ts            # definição de rotas (lazy por feature)
├── layouts/                # layouts reutilizáveis (DefaultLayout, AuthLayout)
├── shared/                 # transversal, sem pertencer a uma feature
│   ├── api/
│   │   ├── httpClient.ts   # cliente HTTP tipado (fetch) + injeção do token
│   │   └── apiRoutes.ts    # caminhos da API (espelha o back-end)
│   ├── components/         # componentes de UI genéricos (BaseButton, BaseInput…)
│   ├── composables/        # composables transversais (useToast, …)
│   ├── types/              # tipos transversais do front-end
│   └── utils/              # funções puras (formatação de moeda, datas…)
└── features/
    ├── auth/
    │   ├── components/     # componentes só da feature
    │   ├── views/          # páginas roteadas (LoginView.vue, RegisterView.vue)
    │   ├── composables/    # lógica reativa da feature (useAuth)
    │   ├── services/       # chamadas à API da feature (authService.ts)
    │   ├── stores/         # store Pinia da feature (auth.store.ts)
    │   └── routes.ts       # rotas da feature, agregadas no router
    └── offers/
        ├── components/
        ├── views/
        ├── composables/
        ├── services/
        └── routes.ts
```

## 3. Regras

1. **Uma feature é autocontida.** Tudo o que só interessa a `offers` vive em
   `features/offers/`. Só sobe para `shared/` quando for usado por ≥ 2 features.
2. **Componentes pequenos e focados.** Se um `.vue` cresce demasiado, extrai componentes
   filhos ou composables. Lógica complexa sai do template para um composable.
3. **Camada de serviços isola a API.** Componentes/composables nunca chamam `fetch`
   diretamente; usam `services/*.ts`, que usam o `httpClient` partilhado.
4. **Tipos vêm dos contracts.** Requests/Responses são importados de `@kinguila/contracts`
   — não se redefinem tipos de API à mão no front-end.
5. **Estado:** estado local no componente/composable por omissão; Pinia só para estado
   verdadeiramente global (ex.: sessão do utilizador).
6. **Nomes claros em inglês** nos ficheiros/variáveis; texto de UI e comentários em
   português.

## 4. Fluxo típico (ex.: listar ofertas)

1. `OffersListView.vue` (em `features/offers/views`) usa o composable `useOffers()`.
2. `useOffers()` chama `offerService.list(filters)`.
3. `offerService` usa `httpClient.get(apiRoutes.offers.list, ...)` e devolve
   `OfferResponse[]` (tipo de `@kinguila/contracts`).
4. A view renderiza com componentes de `features/offers/components` e UI de `shared`.

## 5. Convenções de ficheiros

| Tipo            | Sufixo / padrão           | Exemplo                  |
| --------------- | ------------------------- | ------------------------ |
| View roteada    | `*View.vue`               | `LoginView.vue`          |
| Componente      | `PascalCase.vue`          | `OfferCard.vue`          |
| Composable      | `useX.ts`                 | `useAuth.ts`             |
| Serviço de API  | `xService.ts`             | `offerService.ts`        |
| Store Pinia     | `x.store.ts`              | `auth.store.ts`          |
| Rotas da feature| `routes.ts`               | `features/auth/routes.ts`|

## 6. Responsividade e layouts por dispositivo (telemóvel vs PC)

O design (Figma) tem ecrãs que, em alguns casos, mudam de **estrutura** entre telemóvel e
PC — não só de tamanho. A regra do projeto para lidar com isto é **CSS-first, com uma
válvula de escape**.

### Regra

1. **Por omissão: CSS-first, mobile-first.** Um só template; o CSS reorganiza. Estilos base
   são para telemóvel; `@media (min-width: …)` adiciona progressivamente o layout de ecrãs
   maiores. Grid que passa de 1 para 2 colunas, cartão que estica, espaçamento que cresce —
   tudo isto é **CSS**, não se ramifica nada. (Direção futura ao nível do componente:
   *container queries*.)
2. **Exceção (escape hatch): só quando a estrutura diverge mesmo.** Quando o telemóvel e o PC
   não são o mesmo layout reorganizado mas sim *estruturas diferentes* (ex.: navegação de topo
   no PC vs barra inferior no telemóvel), ramifica-se **apenas esse pedaço** do DOM com
   `v-if`/`v-else` alimentado pelo composable reativo `useBreakpoints`.

> Não partas para ficheiros/DOM separados só porque o Figma mostra dois desenhos — na maioria
> dos casos são o **mesmo layout** em larguras diferentes, e o CSS resolve. O escape hatch é a
> exceção, não a norma.

### Ferramentas

- **Escala de breakpoints — fonte de verdade única:** `shared/breakpoints.ts`
  (`sm 480 · md 768 · lg 1024 · xl 1280`). Corte principal telemóvel|PC = **`md` (768px)**;
  decisões de shell/sidebar usam **`lg` (1024px)**. As `@media` do CSS **não** leem CSS custom
  properties, por isso usa-se o literal px correspondente (documentado em `shared/styles/tokens.css`,
  a manter em sincronia com `breakpoints.ts`).
- **Deteção reativa:** composable `shared/composables/useBreakpoints.ts` — expõe `isMobile`,
  `isDesktop`, `greaterOrEqual(bp)` e o mapa `matches`. É seguro sem `window` (assume desktop).

### Exemplo vivo

`layouts/DefaultLayout.vue` (+ `layouts/components/AppNavDesktop.vue` /
`AppNavMobile.vue`) demonstra o padrão: o **conteúdo** é CSS-first (responsivo por `@media`),
e só a **navegação** usa o escape hatch (`v-if="isMobile"`) por mudar de estrutura entre
telemóvel e PC.

### Testes

Lógica reativa (como o `useBreakpoints`) tem teste em `apps/web/tests/` (camada dedicada que
espelha `src/`, com `bun:test` e `window.matchMedia` mockado). Layout puramente visual/CSS
verifica-se por browser em <768px e ≥768px, não por unit test.
