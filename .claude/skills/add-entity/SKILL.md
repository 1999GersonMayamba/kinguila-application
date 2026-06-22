---
name: add-entity
description: Passos para criar uma entidade de domínio nova no back-end Kinguila com persistência e CRUD completo (domain, schema Drizzle, repositório, serviço, DTOs, controller, rotas, registo no composition root e migration manual). Usar sempre que for preciso uma nova tabela/recurso de negócio.
---

# Criar uma entidade nova (com CRUD)

Segue os passos pela ordem. Usa **`Offer`** e **`Currency`** como referência viva — copia o
padrão deles. Substitui `Foo` pelo nome real (inglês, singular, PascalCase).

> Todos os caminhos são relativos a `apps/api/`.

## 1. Domain — entidade e enums
- Cria `src/domain/entities/Foo.ts` — tipo/classe pura, `id` em `string` (uuid), sem
  importar libs externas.
- Se tiver estados, cria o enum em `src/domain/enums/FooStatus.ts` (union de strings).
- Erros de negócio previsíveis: usa/estende `src/domain/errors/DomainError.ts`.

## 2. Infrastructure — schema Drizzle
- Cria `src/infrastructure/database/schema/foos.ts` com a tabela (`pgTable`):
  - `id` uuid PK, timestamps `createdAt`/`updatedAt`.
  - **Enums como texto** (`text(...)` ou `pgEnum`), nunca inteiros.
  - Montantes monetários em `numeric`, nunca `float`/`real`.
- Reexporta em `src/infrastructure/database/schema/index.ts`. **Sem isto a tabela não
  entra no schema.**

## 3. Application — contrato do repositório
- Cria `src/application/interfaces/repositories/IFooRepository.ts` estendendo
  `IGenericRepository<Foo>` e acrescenta métodos específicos se precisares
  (ex.: `findByUserId`).

## 4. Infrastructure — implementação do repositório
- Cria `src/infrastructure/repositories/FooRepository.ts` herdando
  `DrizzleGenericRepository<Foo>` e implementando `IFooRepository`. Construtor recebe a
  `Database` e passa a tabela `foos` ao `super`.

## 5. Contracts + Application — DTOs
- DTOs partilhados com o front-end vão em `packages/contracts/src/foo.ts`
  (`CreateFooRequest`, `UpdateFooRequest`, `FooResponse`). Reexporta em
  `packages/contracts/src/index.ts`.
- Schema de validação Zod em `src/presentation/http/validators/foo.validators.ts`.

## 6. Application — serviço
- Interface em `src/application/interfaces/services/IFooService.ts`; métodos devolvem
  `Response<T>`.
- Implementação em `src/application/services/FooService.ts`:
  - injeta `IFooRepository` (e outros) por **construtor**;
  - aplica as regras de negócio;
  - mapeia entidade↔DTO num método privado `toResponse(...)`;
  - devolve `Response.ok(...)` / `Response.fail(...)`.

## 7. Application — rotas
- Acrescenta o grupo `Foo` em `src/application/constants/apiRoutes.ts` seguindo o padrão
  (`list`, `getById`, `create`, `update`, `remove`).

## 8. Presentation — controller e rotas
- Cria `src/presentation/http/controllers/FooController.ts` (fino: extrai input, chama o
  serviço, devolve `toHttp(c, result)`).
- Cria `src/presentation/http/routes/foo.routes.ts` que regista as rotas no app Hono
  usando `apiRoutes.foo.*`, `authMiddleware` e `validate(...)`.
- Liga o registo das rotas em `src/presentation/http/server.ts`.

## 9. Composition root (OBRIGATÓRIO)
Em `src/composition/container.ts`:
- instancia `const fooRepository = new FooRepository(db);`
- instancia `const fooService = new FooService(fooRepository);`
- instancia `const fooController = new FooController(fooService);`
- inclui o controller no objeto devolvido para o `server.ts`.
**Sem isto a app falha em runtime.**

## 10. Migration (MANUAL — não aplicar automaticamente)
Indica ao utilizador para correr (ver skill `run-migrations`):
```bash
bun run db:generate     # gera o SQL a partir do schema
# revê o SQL em src/infrastructure/database/migrations/
bun run db:migrate      # aplica na base de dados
```

## 11. Testes (OBRIGATÓRIO)
Cria o teste do serviço em `tests/unit/application/services/FooService.test.ts` usando
fakes das interfaces (ver skill `write-tests`). Cobre caminho feliz e de erro.

## 12. Validar
```bash
bun run typecheck
bun run lint
bun run test
```

## Checklist final
- [ ] Entidade + enums no `domain`
- [ ] Tabela em `schema/` + reexport no `schema/index.ts`
- [ ] Interface + implementação do repositório
- [ ] DTOs em `packages/contracts` + validators Zod
- [ ] Interface + implementação do serviço (`Response<T>`)
- [ ] Rotas em `apiRoutes`
- [ ] Controller + rotas registadas no `server.ts`
- [ ] Repositório, serviço e controller ligados no `composition/container.ts`
- [ ] Teste do serviço em `tests/` (com fakes)
- [ ] `bun run typecheck`, `bun run lint` e `bun run test` sem erros
- [ ] Comandos de migration entregues ao utilizador (não aplicados pelo agente)
