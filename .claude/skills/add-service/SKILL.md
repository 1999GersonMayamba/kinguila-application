---
name: add-service
description: Passos para adicionar regras de negócio novas (um serviço de aplicação) ao back-end Kinguila sem necessariamente criar uma entidade nova — por exemplo orquestrar repositórios existentes ou expor uma operação nova. Usar quando a tarefa é lógica/fluxo e não uma tabela nova.
---

# Adicionar um serviço de aplicação

Usar quando precisas de regras de negócio novas que **não** exigem uma tabela nova (essa é
a skill `add-entity`). Substitui `Foo` pelo nome real.

> Caminhos relativos a `apps/api/`.

## 1. Contrato
- Cria `src/application/interfaces/services/IFooService.ts`. Cada método devolve
  `Promise<Response<T>>`. Tipa entradas/saídas com DTOs (de `packages/contracts` quando
  expostos à UI).

## 2. Implementação
- Cria `src/application/services/FooService.ts` implementando a interface.
  - Recebe dependências (repositórios, outros serviços, integrações) por **construtor**.
  - Não conhece Hono nem Drizzle diretamente — só interfaces da `application`.
  - Sucesso: `Response.ok(data, 'mensagem')`. Erro previsível: `Response.fail('mensagem')`.
  - Operações que escrevem em várias tabelas usam transação (ver `DrizzleGenericRepository`).

## 3. Expor por HTTP (se aplicável)
- Acrescenta as rotas em `src/application/constants/apiRoutes.ts`.
- Cria/atualiza o controller em `src/presentation/http/controllers/` e o ficheiro de rotas
  em `src/presentation/http/routes/`. Valida input com Zod (`validate(...)`).

## 4. Composition root (OBRIGATÓRIO)
- Em `src/composition/container.ts`, instancia o serviço com as suas dependências e
  injeta-o onde for consumido (controller e/ou outros serviços).

## 5. Testar (OBRIGATÓRIO)
- Testa o serviço com repositórios/integrações _fake_ (implementam a interface), sem BD,
  em `tests/unit/application/services/FooService.test.ts` (ver skill `write-tests`).

## 6. Validar
```bash
bun run typecheck
bun run lint
bun run test
```

## Checklist
- [ ] Interface do serviço (`Response<T>`)
- [ ] Implementação com dependências por construtor
- [ ] Rotas/controller/validação (se exposto por HTTP)
- [ ] Ligado no `composition/container.ts`
- [ ] Testes com fakes
- [ ] `typecheck` + `lint` ok
