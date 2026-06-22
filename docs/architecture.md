# Arquitetura — Back-end (apps/api)

Documento de referência da arquitetura e dos padrões do back-end. Objetivo: qualquer
agente consegue implementar uma funcionalidade nova **copiando os padrões existentes** sem
se perder.

## 1. Visão geral

- **Stack:** Bun, TypeScript, [Hono](https://hono.dev) (HTTP), [Drizzle ORM](https://orm.drizzle.team)
  sobre **PostgreSQL**, módulo Identity próprio (argon2id via `Bun.password` + JWT), Zod
  (validação), Biome (lint/format).
- **Estilo:** Clean Architecture com fluxo de dependências para dentro
  (`presentation → application → domain`; a `infrastructure` implementa as interfaces da
  `application`).
- **Arranque:** `main.ts` chama o _composition root_ (`composition/container.ts`), que
  instancia e liga repositórios → serviços → controllers, e arranca o servidor Hono.

```
            ┌─────────────────────────────────────────────┐
            │                presentation                  │  Hono: controllers, rotas, middlewares
            │  (depende de application)                    │
            └───────────────────┬─────────────────────────┘
                                │  usa interfaces
            ┌───────────────────▼─────────────────────────┐
            │                application                   │  serviços, interfaces, DTOs, Response<T>
            │  (depende de domain)                         │
            └───────────────────┬─────────────────────────┘
                                │
            ┌───────────────────▼─────────────────────────┐
            │                  domain                      │  entidades, enums, value objects, erros
            │  (não depende de nada)                       │
            └─────────────────────────────────────────────┘
                                ▲
            ┌───────────────────┴─────────────────────────┐
            │              infrastructure                  │  Drizzle, repositórios, identity, integrações
            │  (implementa interfaces da application)      │
            └─────────────────────────────────────────────┘
```

A regra fundamental: **as setas de dependência apontam sempre para o `domain`**. A
`infrastructure` "fecha o círculo" implementando as interfaces que a `application` declara,
e o `composition` injeta as implementações concretas.

## 2. Camadas em detalhe

### domain (`src/domain/`)
- `entities/` — objetos de negócio puros (ex.: `Offer`, `Currency`, `User`, `Role`). Sem
  dependências de libs externas, sem decoradores de ORM.
- `enums/` — enums de negócio (`OfferStatus`, `OrderStatus`, `CurrencyCode`). **Persistidos
  como texto.**
- `value-objects/` — tipos com invariantes (ex.: `Money`).
- `errors/` — `DomainError` e subtipos. Erros previsíveis do negócio.
- **Não** importa nada de `application`, `infrastructure` ou de libs de I/O.

### application (`src/application/`)
- `interfaces/repositories/` — contratos de acesso a dados. Os específicos estendem
  `IGenericRepository<T>` e acrescentam métodos próprios (ex.: `findByUserId`).
- `interfaces/services/` — contratos dos serviços de negócio (ex.: `IOfferService`).
- `services/` — implementação das regras de negócio. Recebem dependências por construtor
  (DI manual); devolvem sempre `Response<T>`.
- `dtos/requests/`, `dtos/responses/` — objetos de entrada/saída. Os que são partilhados
  com o front-end vivem em `packages/contracts` e são re-exportados aqui quando útil.
- `common/Response.ts` — envelope padrão de resposta.
- `common/PagedResult.ts` — resultado paginado.
- `constants/apiRoutes.ts` — todas as rotas HTTP centralizadas.

### infrastructure (`src/infrastructure/`)
- `database/schema/` — schema Drizzle (uma tabela por ficheiro). `database/schema/index.ts`
  reexporta tudo.
- `database/client.ts` — instância do cliente Drizzle/Postgres.
- `database/migrations/` — migrations geradas pelo Drizzle Kit (**não editar à mão** salvo
  revisão consciente).
- `repositories/DrizzleGenericRepository.ts` — repositório genérico.
- `repositories/*Repository.ts` — repositórios específicos que dele herdam.
- `identity/` — `PasswordHasher` (argon2id) e `JwtTokenService`.
- `integrations/<fornecedor>/` — clientes HTTP tipados de serviços externos.

### presentation (`src/presentation/http/`)
- `controllers/` — **finos**; extraem input, chamam o serviço e mapeiam `Response<T>` para
  resposta HTTP. Nenhuma regra de negócio aqui.
- `routes/` — registo das rotas no app Hono, usando `apiRoutes` e os middlewares.
- `middlewares/` — `authMiddleware` (valida JWT, injeta o utilizador), `errorHandler`,
  `validate` (Zod).
- `server.ts` — cria o app Hono, aplica middlewares globais e regista as rotas.

### composition (`src/composition/container.ts`)
- _Composition root_: o único sítio que conhece implementações concretas. Instancia o
  cliente da BD, os repositórios, os serviços e os controllers, e devolve-os para o
  `server.ts`/`main.ts`. **É aqui que se "regista" cada dependência nova.**

### config (`src/config/env.ts`)
- Lê `process.env`, valida com Zod e expõe um objeto `env` tipado. Falha cedo se faltar
  algo obrigatório.

## 3. Padrões obrigatórios

### Repository
Interface específica em `application/interfaces/repositories`, estendendo o genérico:

```ts
export interface IOfferRepository extends IGenericRepository<Offer> {
  findActiveByCurrencyPair(sell: CurrencyCode, buy: CurrencyCode): Promise<Offer[]>;
}
```

Implementação em `infrastructure/repositories`, herdando `DrizzleGenericRepository`:

```ts
export class OfferRepository
  extends DrizzleGenericRepository<Offer>
  implements IOfferRepository
{
  constructor(db: Database) {
    super(db, offers);
  }
  // métodos específicos usando this.db / this.table
}
```

O `DrizzleGenericRepository<T>` oferece `findById`, `findAll`, `create`, `update`,
`delete` e suporte a transações.

### Serviço
- Interface em `application/interfaces/services`, implementação em `application/services`.
- Métodos devolvem `Response<T>`: sucesso via `Response.ok(data, 'mensagem')`, erro via
  `Response.fail('mensagem', errors?)`.
- Dependências recebidas por **construtor** (não há container mágico; ver `composition`).
- Mapeamento entidade→DTO num método privado `toResponse(...)`.

### `Response<T>`
Envelope com `succeeded`, `message`, `errors`, `data`. Os controllers convertem em status
HTTP a partir de `succeeded` (e de um eventual `statusCode` sugerido).

### Controller (Hono)
```ts
export class OfferController {
  constructor(private readonly offerService: IOfferService) {}

  create = async (c: Context) => {
    const body = await c.req.json();
    const result = await this.offerService.create(body, c.get('userId'));
    return toHttp(c, result);
  };
}
```
- Rotas **sempre** via `apiRoutes`.
- O `userId` vem do `authMiddleware` (claims do JWT), acedido via `c.get('userId')`.
- `toHttp` é o helper que traduz `Response<T>` → resposta Hono.

### Validação (Zod)
Cada endpoint de escrita tem um schema Zod e usa o middleware `validate(schema)` antes do
controller. O tipo inferido do schema alinha com o DTO em `packages/contracts`.

### Enums como texto
Colunas de enum são `text` (ou `pgEnum`) no Drizzle; nunca inteiros. Mantém legível em BD
e nas respostas JSON.

## 4. Fluxo de um pedido (exemplo: criar oferta)

1. `POST /api/v1/offers` → `authMiddleware` valida o JWT e injeta `userId`.
2. `validate(createOfferSchema)` valida o body.
3. `OfferController.create` extrai o body e o `userId`, chama `IOfferService.create`.
4. `OfferService` aplica regras (taxa válida, moeda suportada, montante > 0), persiste via
   `IOfferRepository.create`, mapeia para `OfferResponse`.
5. Devolve `Response<OfferResponse>`; o controller converte em `201`/`400`.

## 5. Base de dados

- Provider PostgreSQL via Drizzle (`database/client.ts`).
- Configuração do Drizzle Kit em `apps/api/drizzle.config.ts`.
- Geração de migration e atualização da BD são **manuais** — ver
  [`.claude/skills/run-migrations/SKILL.md`](../.claude/skills/run-migrations/SKILL.md).

## 6. Testes

- `bun:test`. Os serviços testam-se com repositórios _fake_ (implementam a interface), sem
  tocar na BD. Testes de integração de repositório usam uma BD de teste dedicada.
