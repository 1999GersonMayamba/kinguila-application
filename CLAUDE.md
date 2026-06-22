# Kinguila — Guia para Agentes de IA

Plataforma **P2P de compra e venda de divisas** (Bun + TypeScript no back-end, Vue 3 no
front-end). Este ficheiro é o **ponto de entrada** para qualquer agente que vá implementar
funcionalidades. **Lê-o primeiro e segue os padrões existentes — não inventes estruturas
novas.**

## O que é o produto

A plataforma une compradores e vendedores de divisas. Um vendedor publica uma **oferta**
(ex.: "vendo 1 000 000 Kz por reais à taxa X"); um comprador encontra a oferta e abre uma
**ordem** de compra. A plataforma faz o meio-campo digital. Glossário completo em
[`docs/domain-glossary.md`](docs/domain-glossary.md).

## Regras de ouro (não negociáveis)

1. **Respeita as camadas.** O `domain` não depende de nada. A `application` define
   interfaces (contratos); a `infrastructure` implementa-as. A `presentation` (Hono) só
   chama serviços. Detalhe em [`docs/architecture.md`](docs/architecture.md).
2. **Ficheiros curtos e de responsabilidade única.** Uma classe/serviço/controller por
   ficheiro. Se um ficheiro passa de ~200 linhas ou faz mais do que uma coisa, divide-o.
3. **Nomes claros e em inglês no código** (entidades, variáveis, ficheiros). Comentários e
   documentação em **português**. Nada de abreviaturas obscuras.
4. **Migrations e base de dados são SEMPRE manuais.** Nunca apliques migrations
   automaticamente. Alteras o schema, geras a migration, **revês**, e indicas o comando ao
   utilizador. Ver [`.claude/skills/run-migrations/SKILL.md`](.claude/skills/run-migrations/SKILL.md).
5. **Tudo o que é injetável tem de ser registado** no _composition root_
   (`apps/api/src/composition/container.ts`), senão a app falha em runtime.
6. **Enums persistem como texto**, nunca como número (colunas Postgres do tipo texto).
7. **Toda implementação tem o seu teste.** Serviços, repositórios e integrações têm teste
   em `apps/api/tests/` (camada dedicada que espelha `src/`, **nunca** co-localizado). Ver
   [`docs/testing.md`](docs/testing.md) e a skill `write-tests`.
8. **Segue as convenções.** Nomenclatura e princípios de Clean Architecture estão em
   [`docs/conventions.md`](docs/conventions.md) — é leitura obrigatória.
9. **Valida antes de terminar:** `bun run typecheck`, `bun run lint` e `bun run test`. Não
   corras a app contra base de dados de produção.

## Mapa do monorepo

| Caminho               | Responsabilidade                                                  |
| --------------------- | ----------------------------------------------------------------- |
| `apps/api`            | Back-end Bun + Hono + Drizzle, Clean Architecture                 |
| `apps/web`            | Front-end Vue 3 + Vite, arquitetura por _feature_                 |
| `packages/contracts`  | Tipos/DTOs partilhados entre FE e BE (sem lógica, só tipos)       |
| `docs/`               | Arquitetura, glossário de domínio, ADRs                           |
| `.claude/skills/`     | Skills passo-a-passo (ver abaixo)                                 |

## Camadas do back-end (`apps/api/src/`)

Fluxo de dependências **para dentro**: `presentation → application → domain`.
A `infrastructure` implementa as interfaces da `application`.

| Pasta            | Responsabilidade                                                       | Depende de        |
| ---------------- | ---------------------------------------------------------------------- | ----------------- |
| `domain/`        | Entidades, enums, _value objects_, erros de domínio. Sem libs externas. | —                 |
| `application/`   | Serviços (regras de negócio), interfaces (Services + Repositories), DTOs, `Response<T>`, rotas (`apiRoutes`). | `domain`          |
| `infrastructure/`| Drizzle (schema, client, migrations), repositórios, Identity (hash/JWT), integrações externas. | `application`, `domain` |
| `presentation/`  | Hono: controllers (finos), rotas, middlewares.                          | `application`     |
| `composition/`   | _Composition root_: instancia e liga tudo (DI manual).                  | todas             |
| `config/`        | Leitura e validação de variáveis de ambiente (Zod).                     | —                 |
| `shared/`        | Utilitários puros transversais.                                         | —                 |

## Skills disponíveis (`.claude/skills/`)

Quando a tarefa corresponder, **segue a skill passo a passo**:

- **`add-entity`** — criar uma entidade nova com persistência e CRUD completo (domain →
  schema Drizzle → repositório → serviço → controller → rotas → DI → migration manual).
  Usa `Offer`/`Currency` como referência viva.
- **`add-service`** — adicionar regras de negócio (um serviço de aplicação) sem
  necessariamente uma entidade nova.
- **`add-integration`** — fornecedor externo (pagamentos, KYC, taxas...) na
  `infrastructure/integrations`: cliente HTTP tipado + Settings + registo no container.
  Cobre também adicionar uma rota nova a uma integração existente. Ver
  [`docs/integrations.md`](docs/integrations.md).
- **`write-tests`** — escrever testes na camada dedicada `apps/api/tests/`.
- **`run-migrations`** — comandos exatos do Drizzle Kit (executados **manualmente** pelo
  utilizador).
- **`add-frontend-feature`** — criar uma _feature_ nova no front-end Vue seguindo a
  estrutura por feature.

## Padrões-chave (resumo)

- **Repository:** interface específica em `application/interfaces/repositories` herda de
  `IGenericRepository<T>`; implementação em `infrastructure/repositories` herda de
  `DrizzleGenericRepository<T>`.
- **Serviço:** devolve sempre `Response<T>` (`Response.ok(...)` / `Response.fail(...)`).
  O controller decide o status HTTP a partir de `response.succeeded`.
- **Rotas:** centralizadas em `application/constants/apiRoutes.ts`. Nunca strings soltas.
- **Validação:** DTOs de entrada validados com **Zod** na camada de presentation.
- **Tipos partilhados:** Requests/Responses expostos à UI vivem em `packages/contracts`.
- **Integrações externas:** contrato (`I...Provider`) na `application`; cliente que estende
  `HttpIntegrationClient` na `infrastructure/integrations`; modelos crus do fornecedor
  isolados. Ver [`docs/integrations.md`](docs/integrations.md).
- **Testes:** em `apps/api/tests/` (espelha `src/`), com fakes das interfaces / `fetch`
  mockado. Ver [`docs/testing.md`](docs/testing.md).

## Documentação de referência

- [`docs/conventions.md`](docs/conventions.md) — **convenções e princípios** (ler primeiro)
- [`docs/architecture.md`](docs/architecture.md) — arquitetura do back-end
- [`docs/frontend-architecture.md`](docs/frontend-architecture.md) — arquitetura do front-end
- [`docs/integrations.md`](docs/integrations.md) — integrações externas
- [`docs/testing.md`](docs/testing.md) — estratégia de testes
- [`docs/domain-glossary.md`](docs/domain-glossary.md) — linguagem ubíqua

## Pontos de atenção conhecidos

- O módulo Identity é próprio (não há biblioteca de auth externa). Hash com
  `Bun.password` (argon2id); tokens JWT assinados com `JWT_SECRET`.
- O exemplo `Offer` + `Currency` é a **referência viva** — copia-o ao criar recursos novos.
- Há _seed_ de moedas suportadas; novas divisas entram por seed/migration, não hardcoded
  na lógica.
