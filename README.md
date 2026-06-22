# Kinguila

Plataforma **P2P de compra e venda de divisas** entre particulares. A Kinguila une
compradores e vendedores de moeda de forma digital, sem intermediação manual: a
plataforma faz o "meio-campo" entre quem tem uma divisa e quem precisa dela.

> **Exemplo:** estou no Brasil com reais (BRL) e preciso de kwanzas (AOA/Kz) para
> enviar a Angola. Entro na plataforma, encontro ofertas de quem está a vender Kz,
> escolho uma e faço a compra — tudo digital.

Este é um projeto **IA-native**: a documentação e as _skills_ em [`.claude/`](.claude/)
existem para que qualquer agente (e qualquer pessoa) consiga implementar
funcionalidades **seguindo os padrões existentes**, sem inventar estruturas novas.

---

## Stack

| Camada        | Tecnologia                                                        |
| ------------- | ----------------------------------------------------------------- |
| Back-end      | **Bun** + **TypeScript** + **Hono** (Clean Architecture)          |
| ORM / BD      | **Drizzle ORM** + **PostgreSQL**                                  |
| Autenticação  | Módulo **Identity** próprio (User/Role, argon2id, JWT)            |
| Front-end     | **Vue 3** + **Vite** + **TypeScript** (arquitetura por _feature_) |
| Tipos partilhados | **`packages/contracts`** (DTOs entre FE e BE)                 |
| Lint / Format | **Biome**                                                         |

## Estrutura do monorepo

```
kinguila-application/
├── apps/
│   ├── api/                # Back-end (Bun + Hono + Drizzle) — Clean Architecture
│   └── web/                # Front-end (Vue 3 + Vite) — arquitetura por feature
├── packages/
│   └── contracts/          # Tipos/DTOs partilhados entre back-end e front-end
├── docs/                   # Documentação de arquitetura, glossário e ADRs
├── .claude/                # CLAUDE.md, skills e docs para agentes de IA
├── docker-compose.yml      # PostgreSQL local
├── biome.json              # Lint + format (todo o monorepo)
└── tsconfig.base.json      # Configuração TS partilhada
```

Cada `app`/`package` tem o seu próprio `README.md` com detalhes.

## Arranque rápido

Pré-requisitos: [Bun](https://bun.sh) ≥ 1.1 e Docker (para o PostgreSQL).

```bash
# 1. Instalar dependências de todo o monorepo
bun install

# 2. Subir o PostgreSQL
docker compose up -d

# 3. Configurar o ambiente do back-end
cp .env.example apps/api/.env

# 4. Gerar e aplicar o schema na base de dados
bun run db:generate
bun run db:migrate

# 5. Arrancar back-end e front-end (em terminais separados)
bun run dev:api    # http://localhost:3333
bun run dev:web    # http://localhost:5173
```

## Scripts úteis (raiz)

| Script                 | Descrição                                              |
| ---------------------- | ------------------------------------------------------ |
| `bun run dev:api`      | Arranca o back-end em modo watch                       |
| `bun run dev:web`      | Arranca o front-end (Vite)                             |
| `bun run db:generate`  | Gera migrations Drizzle a partir do schema             |
| `bun run db:migrate`   | Aplica migrations na base de dados                     |
| `bun run db:studio`    | Abre o Drizzle Studio                                  |
| `bun run lint`         | Verifica lint/format com Biome                         |
| `bun run lint:fix`     | Corrige problemas de lint/format                       |
| `bun run typecheck`    | Verifica tipos em todos os packages                    |
| `bun run test`         | Corre os testes do back-end                            |

## Para agentes de IA

Lê primeiro o [`CLAUDE.md`](CLAUDE.md). Ele aponta para as _skills_ em
[`.claude/skills/`](.claude/skills/) e para a documentação de arquitetura em
[`docs/`](docs/). **Segue os padrões existentes — não inventes estruturas novas.**

## Documentação

- [`docs/conventions.md`](docs/conventions.md) — convenções e princípios de Clean Architecture (ler primeiro)
- [`docs/architecture.md`](docs/architecture.md) — arquitetura do back-end
- [`docs/frontend-architecture.md`](docs/frontend-architecture.md) — arquitetura do front-end
- [`docs/integrations.md`](docs/integrations.md) — integrações com APIs externas
- [`docs/testing.md`](docs/testing.md) — estratégia e camada de testes
- [`docs/domain-glossary.md`](docs/domain-glossary.md) — linguagem ubíqua do domínio
- [`docs/getting-started.md`](docs/getting-started.md) — guia detalhado de arranque
- [`docs/adr/`](docs/adr/) — registos de decisões de arquitetura (ADRs)
