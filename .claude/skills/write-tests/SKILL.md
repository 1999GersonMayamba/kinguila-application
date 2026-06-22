---
name: write-tests
description: Passos para escrever testes no back-end Kinguila. Toda implementação (serviço, repositório, integração) deve ter o seu teste, numa camada dedicada apps/api/tests que espelha src/ (não co-localizado). Usar ao implementar lógica nova ou ao pedir cobertura de testes.
---

# Escrever testes

Lê [`docs/testing.md`](../../../docs/testing.md). **Regra:** toda implementação tem o seu
teste. Os testes vivem em `apps/api/tests/` (separado de `src/`), espelhando a estrutura
de `src/`. Runner: `bun:test`.

> Caminhos relativos a `apps/api/`.

## 1. Localizar o teste
Coloca o ficheiro em `tests/<unit|integration>/<mesmo caminho do src>/<Unidade>.test.ts`.
Exemplos:
- `src/application/services/OfferService.ts` → `tests/unit/application/services/OfferService.test.ts`
- `src/infrastructure/integrations/foo/FooClient.ts` → `tests/unit/infrastructure/integrations/FooClient.test.ts`

## 2. Teste de serviço (com fakes)
- Usa/cria fakes em `tests/helpers/fakes/` que implementam as **interfaces** da application
  (nunca Drizzle/BD). Ver `FakeOfferRepository`, `FakeCurrencyRepository`.
- Injeta os fakes no serviço e verifica regras de negócio e o `Response<T>`
  (`succeeded` **e** `statusCode`), no caminho feliz e nos de erro/validação.
- Referência: `tests/unit/application/services/OfferService.test.ts`.

## 3. Teste de cliente de integração (com fetch mockado)
- Substitui `globalThis.fetch` por um stub que devolve uma `Response` controlada; restaura
  no `afterEach`.
- Verifica o **mapeamento** resposta crua → domínio e que respostas não-OK lançam
  `IntegrationError`.
- Referência: `tests/unit/infrastructure/integrations/ExchangeRateClient.test.ts`.

## 4. Fakes reutilizáveis
Se um fake serve vários testes, coloca-o em `tests/helpers/fakes/<FakeX>.ts` e implementa a
interface completa. Mantém-no simples (em memória).

## 5. Correr
```bash
bun run test          # tudo
bun run test:watch    # watch
```

## Checklist
- [ ] Ficheiro em `tests/`, caminho equivalente ao do `src/`, nome `<Unidade>.test.ts`
- [ ] Caminho feliz + caminhos de erro/validação cobertos
- [ ] Sem BD/rede reais em testes unitários (fakes/mocks)
- [ ] Fakes implementam interfaces da application, não detalhes de infra
- [ ] `bun run test` passa
