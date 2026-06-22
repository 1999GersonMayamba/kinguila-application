# Testes — @kinguila/api

Camada de testes **dedicada e separada do `src/`** (não polui o código de produção).
A estrutura **espelha a de `src/`**, por camada.

```
tests/
├── unit/                         # testes unitários (sem I/O real)
│   ├── application/services/     # serviços com repositórios/integrações fake
│   └── infrastructure/integrations/  # clientes de integração com fetch mockado
├── integration/                  # (futuro) repositórios contra BD de teste
└── helpers/
    └── fakes/                    # implementações fake das interfaces (reutilizáveis)
```

## Regra

**Toda implementação tem o seu teste.** Ao criar um serviço, repositório ou integração,
cria o respetivo ficheiro de teste em `tests/`, no caminho equivalente ao do `src/`.

## Convenções

- Nome do ficheiro: `<NomeDaUnidade>.test.ts` (ex.: `OfferService.test.ts`).
- Localização: `tests/<unit|integration>/<mesma estrutura de pastas do src>/`.
- Imports do código de produção via caminho relativo a partir de `tests/`
  (ex.: `../../../src/application/services/OfferService`).
- Fakes partilhados vivem em `tests/helpers/fakes/` e implementam as **interfaces** da
  Application (nunca dependem de Drizzle nem da BD).

## Tipos de teste

- **Unitário de serviço:** injeta fakes (ex.: `FakeOfferRepository`) e verifica regras de
  negócio e o `Response<T>` devolvido. Sem BD, sem rede.
- **Unitário de integração (cliente HTTP):** mocka o `fetch` global e verifica o
  mapeamento da resposta e o tratamento de erro (`IntegrationError`).
- **Integração (futuro):** repositórios contra uma BD de teste dedicada.

## Correr

```bash
bun run test         # corre tudo em tests/
bun run test:watch   # modo watch
```

Detalhe e exemplos em [`../../../docs/testing.md`](../../../docs/testing.md) e na skill
`write-tests`.
