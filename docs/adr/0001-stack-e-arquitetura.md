# ADR 0001 — Stack e arquitetura base

- **Estado:** Aceite
- **Data:** 2026-06-21

## Contexto

Arranque de um projeto novo (Kinguila) — plataforma P2P de compra e venda de divisas.
Requisitos: ser IA-native (documentação + skills), back-end e front-end bem organizados,
Clean Architecture, ficheiros curtos com responsabilidade única, e nomenclatura clara.

## Decisão

- **Monorepo** com Bun workspaces: `apps/api`, `apps/web`, `packages/contracts`.
- **Back-end:** Bun + TypeScript + Hono, Clean Architecture (domain / application /
  infrastructure / presentation), DI manual num _composition root_.
- **ORM/BD:** Drizzle ORM + PostgreSQL. Migrations manuais (gerar → rever → aplicar).
- **Autenticação:** módulo Identity próprio (entidades User/Role, `Bun.password` argon2id,
  JWT) em vez de biblioteca externa, para controlo total e alinhamento com Clean
  Architecture.
- **Front-end:** Vue 3 + Vite + TypeScript, arquitetura por _feature_.
- **Tipos partilhados:** `packages/contracts` com os DTOs de API.
- **Lint/format:** Biome em todo o monorepo.

## Alternativas consideradas

- **Elysia** em vez de Hono: mais nativo do Bun, mas mais acoplado; Hono mantém a framework
  como detalhe de entrega, melhor para Clean Architecture.
- **Better Auth** em vez de Identity próprio: arranque mais rápido, mas impõe schema/fluxo
  próprios e foge ao padrão de camadas.
- **Duas pastas simples** em vez de monorepo: perde a partilha automática de tipos FE/BE.

## Consequências

- Tipos de API partilhados reduzem divergência entre front-end e back-end.
- A DI manual obriga a registar dependências no `composition/container.ts` (documentado
  como regra de ouro).
- O módulo Identity próprio exige manutenção (hashing, tokens), assumida conscientemente.
