# Getting Started

Guia detalhado para pôr o Kinguila a correr localmente e para o fluxo de desenvolvimento.

## Pré-requisitos

- [Bun](https://bun.sh) ≥ 1.1
- Docker + Docker Compose (para o PostgreSQL)
- Editor com suporte a Biome (recomendado: extensão Biome no VS Code)

## 1. Instalar dependências

A partir da raiz (instala todos os workspaces de uma vez):

```bash
bun install
```

## 2. Base de dados

```bash
docker compose up -d        # sobe o PostgreSQL em localhost:5432
```

Credenciais por omissão (ver `docker-compose.yml`): utilizador `kinguila`, password
`kinguila`, base de dados `kinguila`.

## 3. Variáveis de ambiente

```bash
cp .env.example apps/api/.env
```

Edita `apps/api/.env` se precisares (em particular `JWT_SECRET` para algo robusto).

## 4. Schema e migrations

O schema vive em `apps/api/src/infrastructure/database/schema/`. Para refletir na BD:

```bash
bun run db:generate    # gera SQL de migration a partir do schema
# revê o SQL gerado em apps/api/src/infrastructure/database/migrations/
bun run db:migrate     # aplica na base de dados
```

> Migrations são **sempre** geradas e aplicadas manualmente. Ver
> [`.claude/skills/run-migrations/SKILL.md`](../.claude/skills/run-migrations/SKILL.md).

(Opcional) Inspecionar a BD:

```bash
bun run db:studio
```

## 5. Arrancar a aplicação

Em dois terminais:

```bash
bun run dev:api    # back-end  → http://localhost:3333
bun run dev:web    # front-end → http://localhost:5173
```

Verifica a saúde da API:

```bash
curl http://localhost:3333/health
```

## 6. Fluxo de desenvolvimento

1. Vais criar um recurso novo? Segue a skill **`add-entity`**.
2. Só regras de negócio? Skill **`add-service`**.
3. Integração externa? Skill **`add-integration`**.
4. Feature de front-end? Skill **`add-frontend-feature`**.
5. Antes de terminar qualquer tarefa:
   ```bash
   bun run typecheck
   bun run lint
   bun run test
   ```

## 7. Estrutura de portas

| Serviço     | Porta  |
| ----------- | ------ |
| API (Hono)  | 3333   |
| Web (Vite)  | 5173   |
| PostgreSQL  | 5432   |
