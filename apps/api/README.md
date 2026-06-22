# @kinguila/api

Back-end da Kinguila — **Bun + TypeScript + Hono + Drizzle (PostgreSQL)**, em **Clean
Architecture**.

> Antes de implementar, lê [`../../CLAUDE.md`](../../CLAUDE.md) e
> [`../../docs/architecture.md`](../../docs/architecture.md).

## Estrutura

```
src/
├── domain/            # entidades, enums, value objects, erros (sem libs externas)
├── application/       # serviços, interfaces, DTOs, Response<T>, apiRoutes
├── infrastructure/    # Drizzle (schema/client/migrations), repositórios, identity
├── presentation/      # Hono: controllers, rotas, middlewares, validators
├── composition/       # composition root (DI manual) — container.ts
├── config/            # validação de env (Zod)
└── main.ts            # entrypoint (arranca o servidor Bun)
```

Regra de dependências: `presentation → application → domain`; a `infrastructure`
implementa as interfaces da `application`. Detalhe e padrões em
[`../../docs/architecture.md`](../../docs/architecture.md).

## Scripts

| Script                | Descrição                                        |
| --------------------- | ------------------------------------------------ |
| `bun run dev`         | Servidor em modo watch (porta 3333)              |
| `bun run db:generate` | Gera migrations a partir do schema               |
| `bun run db:migrate`  | Aplica migrations                                |
| `bun run db:seed`     | Popula as moedas suportadas                      |
| `bun run db:studio`   | Drizzle Studio                                   |
| `bun run typecheck`   | Verificação de tipos                             |
| `bun run test`        | Testes (bun:test)                                |

## Documentação interativa

- Swagger UI: http://localhost:3333/docs
- OpenAPI JSON: http://localhost:3333/openapi.json

**Toda rota nova tem de ser documentada** em `src/presentation/http/openapi/paths/`.
Ver [`../../docs/api-docs.md`](../../docs/api-docs.md).

## Endpoints (v1)

| Método | Rota                     | Auth | Descrição                       |
| ------ | ------------------------ | ---- | ------------------------------- |
| GET    | `/health`                | —    | Estado do serviço               |
| POST   | `/api/v1/auth/register`  | —    | Registar utilizador             |
| POST   | `/api/v1/auth/login`     | —    | Autenticar (devolve JWT)        |
| GET    | `/api/v1/auth/me`        | ✔    | Utilizador autenticado          |
| GET    | `/api/v1/currencies`     | —    | Moedas suportadas               |
| GET    | `/api/v1/offers`         | —    | Listar ofertas ativas (filtros) |
| GET    | `/api/v1/offers/:id`     | —    | Detalhe de uma oferta           |
| POST   | `/api/v1/offers`         | ✔    | Criar oferta                    |
| PUT    | `/api/v1/offers/:id`     | ✔    | Atualizar oferta (dono)         |
| DELETE | `/api/v1/offers/:id`     | ✔    | Remover oferta (dono)           |

## Adicionar um recurso novo

Segue a skill [`add-entity`](../../.claude/skills/add-entity/SKILL.md). `Offer` + `Currency`
são a referência viva a copiar.
