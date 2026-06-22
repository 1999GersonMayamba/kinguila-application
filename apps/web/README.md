# @kinguila/web

Front-end da Kinguila — **Vue 3 + Vite + TypeScript**, organizado por **feature**.

> Arquitetura e convenções em [`../../docs/frontend-architecture.md`](../../docs/frontend-architecture.md).

## Estrutura

```
src/
├── main.ts             # bootstrap (Vue + Pinia + Router)
├── App.vue             # shell raiz (seleciona o layout)
├── router/             # rotas agregadas das features
├── layouts/            # DefaultLayout, AuthLayout
├── shared/             # transversal: api/, components/, utils/, styles/
└── features/
    ├── auth/           # login/registo, store de sessão
    └── offers/         # listagem de ofertas
```

## Scripts

| Script              | Descrição                       |
| ------------------- | ------------------------------- |
| `bun run dev`       | Vite dev server (porta 5173)    |
| `bun run build`     | Type-check + build de produção  |
| `bun run typecheck` | Verificação de tipos            |

Em dev, as chamadas a `/api` são encaminhadas para `http://localhost:3333` via proxy do
Vite (ver `vite.config.ts`).

## Criar uma feature

Segue a skill [`add-frontend-feature`](../../.claude/skills/add-frontend-feature/SKILL.md).
`features/auth` e `features/offers` são a referência a copiar.
