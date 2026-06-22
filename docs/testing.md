# Estratégia de testes

**Regra fundamental:** toda implementação tem o seu teste. Ao criar um serviço,
repositório ou integração, cria o respetivo ficheiro de teste.

Os testes vivem numa **camada dedicada e separada do código de produção** —
`apps/api/tests/` — que **espelha a estrutura de `src/`**. Assim não poluímos o `src/` e
é trivial encontrar o teste de qualquer ficheiro.

## Porquê uma camada separada (e não co-localizado)

- Mantém `src/` só com código de produção (o build e a leitura ficam limpos).
- Reflete o modelo mental de "projeto de testes" (como o `*.Tests` no C#), mas sem o peso
  de um workspace separado: os testes importam o `src/` por caminho relativo e reutilizam
  as **interfaces** já definidas.

## Estrutura

```
apps/api/tests/
├── unit/                              # sem I/O real (rápidos, determinísticos)
│   ├── application/services/          # serviços com fakes
│   └── infrastructure/integrations/   # clientes HTTP com fetch mockado
├── integration/                       # (futuro) repositórios contra BD de teste
└── helpers/
    └── fakes/                         # fakes reutilizáveis das interfaces
```

## Convenções

| Item                 | Regra                                                              |
| -------------------- | ------------------------------------------------------------------ |
| Nome do ficheiro     | `<Unidade>.test.ts` (ex.: `OfferService.test.ts`)                  |
| Localização          | `tests/<unit\|integration>/<mesmo caminho do src>/`                |
| Fakes                | `tests/helpers/fakes/`, implementam **interfaces** (não Drizzle)   |
| Runner               | `bun:test` (`describe`/`it`/`expect`)                              |

## Padrões por tipo

### Serviço (unitário)
Injeta fakes das interfaces de que o serviço depende e verifica as **regras de negócio** e
o `Response<T>` devolvido (incluindo `succeeded` e `statusCode`). Sem BD, sem rede.

```ts
const offers = new FakeOfferRepository();
const currencies = new FakeCurrencyRepository();
const service = new OfferService(offers, currencies);
const result = await service.create(request, 'seller-1');
expect(result.succeeded).toBe(true);
```

Referência: `tests/unit/application/services/OfferService.test.ts`.

### Cliente de integração (unitário)
Mocka o `fetch` global e verifica o **mapeamento** da resposta crua → domínio e o
**tratamento de erro** (`IntegrationError` em respostas não-OK).

Referência: `tests/unit/infrastructure/integrations/ExchangeRateClient.test.ts`.

### Repositório (integração — futuro)
Corre contra uma BD de teste dedicada (não a de desenvolvimento). Cria/limpa dados por
teste. A configurar quando surgir a primeira necessidade.

## Correr

```bash
bun run test          # tudo em apps/api/tests
bun run test:watch    # modo watch
```

## Checklist ao implementar algo novo

- [ ] Criei o ficheiro de teste em `tests/`, no caminho equivalente ao do `src/`.
- [ ] Testei o caminho feliz **e** os caminhos de erro/validação.
- [ ] Não toquei em BD/rede reais em testes unitários (usei fakes/mocks).
- [ ] `bun run test` passa.
