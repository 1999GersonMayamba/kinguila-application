---
name: run-migrations
description: Comandos exatos do Drizzle Kit para gerar e aplicar migrations no back-end Kinguila. As migrations são SEMPRE manuais — o agente altera o schema e entrega os comandos; nunca aplica automaticamente contra a base de dados.
---

# Migrations (Drizzle Kit) — sempre manuais

**Regra de ouro:** o trabalho do agente termina ao alterar o schema em
`apps/api/src/infrastructure/database/schema/` e **indicar os comandos** ao utilizador.
Nunca correr `db:migrate` automaticamente nem tocar numa BD de produção.

## Fluxo

1. **Alterar o schema** (uma tabela por ficheiro em `schema/`, reexportada em
   `schema/index.ts`).

2. **Gerar a migration** (cria SQL a partir do schema):
   ```bash
   bun run db:generate
   ```
   Output em `apps/api/src/infrastructure/database/migrations/`.

3. **Rever o SQL gerado** antes de aplicar. Confirmar nomes de colunas, tipos, índices,
   `NOT NULL`, defaults e, sobretudo, operações destrutivas (drop/rename de colunas com
   dados).

4. **Aplicar na base de dados** (manual, feito pelo utilizador):
   ```bash
   bun run db:migrate
   ```

5. (Opcional) Inspecionar:
   ```bash
   bun run db:studio
   ```

## Notas

- Os scripts acima existem na raiz (`package.json`) e delegam em `apps/api`. Dentro de
  `apps/api` os equivalentes são `drizzle-kit generate` / `drizzle-kit migrate`.
- Configuração em `apps/api/drizzle.config.ts` (lê `DATABASE_URL` do `.env`).
- **Não editar migrations já aplicadas.** Para corrigir, gera uma nova.
- Enums persistem como **texto**; confirma isso no SQL gerado.
