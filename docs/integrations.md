# Integrações externas

A Kinguila vai depender de **muitas APIs externas** (pagamentos, KYC, taxas de câmbio,
notificações, etc.). Para que isto não vire um caos, todas as integrações seguem **o mesmo
padrão** e vivem no **mesmo sítio**. Este documento descreve esse padrão; a skill
[`add-integration`](../.claude/skills/add-integration/SKILL.md) é o passo-a-passo prático.

## Princípios (Clean Architecture)

1. **A Application define o contrato; a Infrastructure implementa-o.** A lógica de negócio
   depende de uma **interface** (ex.: `IExchangeRateProvider`, `IPaymentGateway`,
   `IKycProvider`), nunca de um fornecedor concreto. Trocar de fornecedor não toca na
   Application.
2. **Os modelos do fornecedor não vazam.** Cada integração tem os seus próprios modelos
   crus (o formato exato da API externa) e mapeia-os para tipos do domínio **dentro do
   cliente**. A Application só vê tipos limpos.
3. **Segredos vêm de configuração** (`config/env.ts` + `.env`), nunca hardcoded.
4. **Falhas externas são `IntegrationError`**, não exceções soltas. O serviço da Application
   apanha-o e devolve o `Response.fail` adequado.

```
application/interfaces/integrations/IFooProvider.ts   ← contrato (a Application depende daqui)
        ▲
        │ implementa
infrastructure/integrations/foo/FooClient.ts          ← cliente HTTP tipado (estende HttpIntegrationClient)
infrastructure/integrations/foo/models/*.ts           ← modelos CRUS do fornecedor (não saem daqui)
infrastructure/integrations/shared/                   ← HttpIntegrationClient + IntegrationError
```

## Onde vive cada coisa

| Caminho (relativo a `apps/api/src/`)                       | Responsabilidade                              |
| ---------------------------------------------------------- | --------------------------------------------- |
| `application/interfaces/integrations/IFooProvider.ts`      | Contrato + tipos de domínio que devolve       |
| `infrastructure/integrations/shared/HttpIntegrationClient.ts` | Base comum: URL, headers, JSON, timeout, erros |
| `infrastructure/integrations/shared/IntegrationError.ts`   | Erro padrão de integração                     |
| `infrastructure/integrations/foo/FooClient.ts`             | Implementação (estende a base, implementa a interface) |
| `infrastructure/integrations/foo/models/*.ts`              | Modelos crus da API externa                   |
| `config/env.ts` + `.env.example`                           | Settings do fornecedor (URL, API key…)        |
| `composition/container.ts`                                 | Instancia o cliente e injeta-o nos serviços   |

## A base: `HttpIntegrationClient`

Equivalente ao "HttpClient tipado" do C#. Centraliza o que toda a integração precisa, para
os clientes ficarem **curtos** e focados só no mapeamento:

- montagem de URL + query string;
- headers por omissão (auth) e por pedido;
- serialização JSON e `Accept`/`Content-Type`;
- timeout por pedido (`AbortSignal.timeout`);
- conversão de qualquer falha (rede ou `!response.ok`) em `IntegrationError`.

Cada cliente concreto só expõe métodos de negócio e mapeia a resposta crua → domínio.
Ver `infrastructure/integrations/exchangeRate/ExchangeRateClient.ts` (**referência viva**).

## Webhooks (callbacks de fornecedores)

Quando um fornecedor chama de volta (ex.: confirmação de pagamento):

1. O endpoint é uma **rota na presentation** (controller fino), tipicamente sem auth de
   utilizador mas com **validação da assinatura/segredo do fornecedor**.
2. O controller delega num **serviço da Application** que aplica as regras e persiste.
3. Nunca pôr lógica de negócio no handler do webhook.

## Dois fluxos comuns

- **Adicionar um fornecedor novo** → cria interface + cliente + settings + registo. Ver a
  skill, secção "A. Nova integração".
- **Adicionar uma operação/rota a um fornecedor existente** → acrescenta o método à
  interface, implementa-o no cliente (novo modelo cru se preciso) e adiciona o teste. Ver a
  skill, secção "B. Nova rota numa integração existente".

## Testes

Toda integração tem teste unitário com `fetch` mockado (mapeamento + erro). Ver
[`testing.md`](testing.md) e a referência em
`apps/api/tests/unit/infrastructure/integrations/ExchangeRateClient.test.ts`.
