# Convenções e princípios de arquitetura

Regras **transversais a todo o monorepo** (back-end e front-end). São de leitura
obrigatória antes de implementar. Objetivo: código consistente, ficheiros curtos,
responsabilidades claras e nomes que se explicam sozinhos.

> Esta é a "constituição" do projeto. As skills em `.claude/skills/` são os procedimentos;
> este documento são os princípios que elas respeitam.

---

## 1. Princípios de Clean Architecture (o essencial)

### 1.1 A regra da dependência
As dependências apontam sempre **para dentro**, em direção ao domínio. Uma camada só pode
conhecer as camadas mais internas — nunca as mais externas.

```
presentation ──▶ application ──▶ domain ◀── infrastructure
```

- **`domain`** — o núcleo. Não importa **nada** de outras camadas nem de bibliotecas de
  I/O (sem Hono, sem Drizzle, sem fetch). Só regras e tipos de negócio.
- **`application`** — orquestra o domínio. Define **interfaces** (contratos) para tudo o
  que é externo (repositórios, integrações, hashing, tokens). Não conhece Hono nem Drizzle.
- **`infrastructure`** — implementa as interfaces da `application` com tecnologia concreta
  (Drizzle, fetch, JWT). É "substituível".
- **`presentation`** — entrega HTTP (Hono). Traduz pedidos→serviços→respostas. Sem regras
  de negócio.
- **`composition`** — o único sítio que conhece implementações concretas; liga tudo (DI).

### 1.2 Dependa de abstrações
Os serviços recebem **interfaces** por construtor, não classes concretas. Quem decide a
implementação é o `composition/container.ts`. Isto permite testar com fakes e trocar
tecnologia sem reescrever a lógica.

### 1.3 Os modelos não atravessam fronteiras crus
- A entidade de `domain` não é o DTO de resposta da API (mapeia-se em `toResponse`).
- O modelo cru de um fornecedor externo não é o tipo de domínio (mapeia-se no cliente).
- O que é partilhado com o front-end vive em `packages/contracts`.

### 1.4 Erros
- `DomainError` — regra de negócio previsível (seguro mostrar ao utilizador).
- `IntegrationError` — falha de um fornecedor externo.
- Serviços devolvem `Response<T>` (`ok`/`fail`/`notFound`/`forbidden`), não lançam para
  controlar fluxo.

---

## 2. Tamanho e responsabilidade dos ficheiros

- **Uma unidade por ficheiro:** uma entidade, um serviço, um controller, um repositório,
  um componente. O nome do ficheiro = nome da unidade.
- **Ficheiros curtos.** Se passa de ~200 linhas ou faz mais do que uma coisa, divide. Um
  serviço com responsabilidades distintas deve ser dois serviços.
- **Funções pequenas e com um só propósito.** Extrai helpers privados (`toResponse`,
  `validatePair`) em vez de métodos gigantes.
- **Sem código morto** nem exports "por via das dúvidas".

---

## 3. Nomenclatura

### 3.1 Idioma
- **Código em inglês:** nomes de ficheiros, classes, funções, variáveis, tabelas, colunas.
- **Português:** comentários, mensagens ao utilizador, documentação. Sempre com acentuação
  correta.

### 3.2 Casing

| Elemento                         | Convenção            | Exemplo                          |
| -------------------------------- | -------------------- | -------------------------------- |
| Classe / Tipo / Interface        | `PascalCase`         | `OfferService`, `ReferenceRate`  |
| Interface (contrato)             | `I` + `PascalCase`   | `IOfferRepository`               |
| Variável / função / método       | `camelCase`          | `availableAmount`, `findById`    |
| Constante de módulo              | `UPPER_SNAKE_CASE`   | `DEFAULT_PAGE_SIZE`, `ROLE_USER` |
| Tipo união de literais (enum)    | `PascalCase`         | `OfferStatus`, `CurrencyCode`    |
| Tabela / coluna (BD)             | `snake_case`         | `available_amount`, `seller_id`  |
| Componente Vue                   | `PascalCase.vue`     | `OfferCard.vue`                  |
| Variável de ambiente             | `UPPER_SNAKE_CASE`   | `DATABASE_URL`, `JWT_SECRET`     |

### 3.3 Sufixos por papel (back-end)

| Papel                    | Sufixo / padrão        | Exemplo                  |
| ------------------------ | ---------------------- | ------------------------ |
| Serviço de aplicação     | `Service`              | `OfferService`           |
| Interface de serviço     | `IService`             | `IOfferService`          |
| Repositório              | `Repository`           | `OfferRepository`        |
| Interface de repositório | `IRepository`          | `IOfferRepository`       |
| Controller               | `Controller`           | `OfferController`        |
| Cliente de integração    | `Client`               | `ExchangeRateClient`     |
| Provedor (contrato)      | `IProvider` / `I...`   | `IExchangeRateProvider`  |
| DTO de entrada           | `...Request`           | `CreateOfferRequest`     |
| DTO de saída             | `...Response`          | `OfferResponse`          |
| Validador Zod            | `*.validators.ts`      | `offer.validators.ts`    |
| Teste                    | `*.test.ts`            | `OfferService.test.ts`   |

### 3.4 Sufixos por papel (front-end)

| Papel            | Padrão            | Exemplo                   |
| ---------------- | ----------------- | ------------------------- |
| View roteada     | `*View.vue`       | `OffersListView.vue`      |
| Componente       | `PascalCase.vue`  | `OfferCard.vue`           |
| Composable       | `useX.ts`         | `useOffers.ts`            |
| Serviço de API   | `xService.ts`     | `offerService.ts`         |
| Store Pinia      | `x.store.ts`      | `auth.store.ts`           |
| Rotas da feature | `routes.ts`       | `features/auth/routes.ts` |

### 3.5 Boas práticas de nomes
- Nomes **descritivos e sem abreviaturas** obscuras (`exchangeRate`, não `exRt`).
- Booleanos com prefixo de estado: `isActive`, `hasRoles`, `canEdit`.
- Funções: verbo + substantivo (`createOffer`, `findByEmail`).
- Coleções no plural (`offers`, `currencies`); item singular (`offer`).

---

## 4. Organização de pastas

### Back-end (`apps/api/src/`)
Por **camada** (ver `architecture.md`): `domain/`, `application/`, `infrastructure/`,
`presentation/`, `composition/`, `config/`, `shared/`. Dentro de cada camada, por papel
(`entities/`, `services/`, `repositories/`, `controllers/`…).

### Front-end (`apps/web/src/`)
Por **feature** (ver `frontend-architecture.md`): `features/<feature>/` autocontida; só
sobe para `shared/` o que for usado por ≥ 2 features.

### Testes (`apps/api/tests/`)
Espelham `src/` (ver `testing.md`).

---

## 5. Imports

- Usa `import type { … }` para imports que são só tipos (regra ativa no Biome).
- O Biome organiza os imports automaticamente (`bun run lint:fix`).
- No front-end, usa o alias `@/` para `src/`. Tipos de API vêm de `@kinguila/contracts`.

---

## 6. Antes de terminar qualquer tarefa

```bash
bun run typecheck
bun run lint
bun run test
```

E confirma:
- [ ] Respeitei a regra da dependência (nada aponta para fora).
- [ ] Ficheiros curtos, uma responsabilidade cada.
- [ ] Nomes segundo as tabelas acima.
- [ ] Registei o que é injetável no `composition/container.ts`.
- [ ] Escrevi o(s) teste(s) em `tests/`.
