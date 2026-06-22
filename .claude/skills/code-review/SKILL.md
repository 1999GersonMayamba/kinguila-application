---
name: code-review
description: Revisão de código do projeto Kinguila contra as regras de ouro, a Clean Architecture e os guard-rails (typecheck/lint/testes/OpenAPI). Usar antes de abrir PR, ao terminar uma fatia/feature, ou para rever o trabalho de um subagente. Produz achados acionáveis (severidade + ficheiro:linha + correção sugerida) e corre o gate de validação. Para diffs grandes, paraleliza a revisão por dimensões com subagentes.
---

# Revisão de código (Kinguila)

Objetivo: entregar **rápido e seguro**. Esta skill verifica que uma alteração respeita os
padrões do projeto **antes** de ser integrada. Lê primeiro [`docs/conventions.md`](../../../docs/conventions.md)
e o [`CLAUDE.md`](../../../CLAUDE.md) (regras de ouro).

## 0. Determinar o alvo da revisão

```bash
git diff --stat                     # alterações não commitadas (working tree)
git diff master... --stat           # alterações da branch vs master (se em feature branch)
```
Revê o diff relevante (working tree, staged, ou `master...HEAD`). Lê os ficheiros tocados
**e** os agregadores que eles deviam atualizar.

## 1. Gate de validação (bloqueante)

Corre e **não aprovar** se algum falhar:
```bash
bun run typecheck
bun run lint
bun run test
```
Para mudanças de back-end com rotas novas, confirma também que aparecem em `/docs`
(arrancar a API e abrir `http://localhost:3333/docs`, ou inspecionar `/openapi.json`).

## 2. Dimensões de revisão

Para cada ficheiro alterado, verifica:

### A. Camadas / Clean Architecture (regra da dependência)
- [ ] `domain` não importa nada de `application`/`infrastructure`/`presentation` nem libs de I/O (Hono, Drizzle, fetch).
- [ ] `application` depende só de **interfaces** (repos, integrações, identity), nunca de classes concretas nem de Hono/Drizzle.
- [ ] `infrastructure` implementa interfaces da `application`; modelos crus de integrações **não vazam**.
- [ ] `presentation` (controllers) é fina: sem regras de negócio.

### B. Registo e agregadores (causa nº1 de bugs em runtime)
- [ ] Tudo o que é injetável está ligado em `composition/container.ts`.
- [ ] Tabela nova reexportada em `database/schema/index.ts`.
- [ ] Rotas registadas em `server.ts` **e** documentadas em `openapi/paths/*.docs.ts` + `openapi/document.ts`.
- [ ] DTOs partilhados reexportados em `packages/contracts/src/index.ts`.
- [ ] Feature de front-end agregada em `router/index.ts`.

### C. Correção e regras de negócio
- [ ] Caminhos de erro tratados; serviços devolvem `Response<T>` (ok/fail/notFound/forbidden), não lançam para controlar fluxo.
- [ ] Validação de input com Zod na rota; `statusCode` coerente.
- [ ] Autorização verificada (ex.: só o dono altera/remove).
- [ ] Montantes monetários em `numeric`/`number`, nunca `float`; enums como **texto**.

### D. Testes (obrigatório)
- [ ] Existe teste em `apps/api/tests/` no caminho equivalente ao do `src/`.
- [ ] Cobre caminho feliz **e** de erro/validação; usa fakes/mocks (sem BD/rede real em unit).

### E. Qualidade e convenções
- [ ] Ficheiros curtos, uma responsabilidade; sem código morto.
- [ ] Nomes segundo [`docs/conventions.md`](../../../docs/conventions.md) (casing, sufixos, inglês no código / português nos comentários).
- [ ] `import type` para imports de tipos; sem `any` injustificado.

### F. Segurança
- [ ] Segredos vêm de `config/env.ts`/`.env`, nunca hardcoded.
- [ ] Sem dados sensíveis em logs/respostas (ex.: `passwordHash` nunca exposto).
- [ ] Rotas de escrita protegidas por `authMiddleware`; webhooks validam assinatura do fornecedor.

### G. Migrations
- [ ] Schema alterado → migration **gerada e entregue ao utilizador** (não aplicada pelo agente). Sem edição de migrations já aplicadas.

## 3. Diffs grandes — paralelizar com subagentes

Se o diff é grande (≥ ~50 linhas) ou toca áreas sensíveis (auth, pagamentos, dados),
lança subagentes em paralelo, um por dimensão (A–G acima), cada um a devolver achados
estruturados. Depois consolida, deduplica e ordena por severidade. (Opcional: usar a skill
`compound-engineering:ce-code-review` para o pipeline completo com verificação adversarial.)

## 4. Formato dos achados

Para cada achado:
```
[severidade] ficheiro:linha — problema
  → correção sugerida
```
Severidades:
- **bloqueante** — quebra build/teste, viola a regra da dependência, falha de segurança, ou não registado/não documentado.
- **importante** — bug provável, regra de negócio em falta, teste em falta.
- **menor** — nomenclatura, duplicação, simplificação.

## 5. Resultado

Termina com um veredito claro:
- ✅ **Aprovado** — gate passa e sem bloqueantes.
- 🔄 **Mudanças pedidas** — lista os bloqueantes/importantes a resolver.

> Esta skill **não** faz push nem aplica migrations. Correções menores podem ser aplicadas
> se o working tree estiver limpo e o pedido for explícito; caso contrário, reporta.

## Checklist final
- [ ] Gate (typecheck + lint + test) verde
- [ ] Dimensões A–G revistas
- [ ] Rotas novas visíveis em `/docs`
- [ ] Achados com severidade + ficheiro:linha + correção
- [ ] Veredito (aprovado / mudanças pedidas)
