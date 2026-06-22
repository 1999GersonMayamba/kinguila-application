---
name: add-integration
description: Passos para integrações com APIs externas (pagamentos, KYC, taxas de câmbio, notificações...) no back-end Kinguila. Cobre dois fluxos — (A) adicionar um fornecedor novo e (B) adicionar uma operação/rota a um fornecedor já existente. Toda integração segue o mesmo padrão (cliente HTTP tipado que estende HttpIntegrationClient, contrato na application, modelos crus isolados, registo no container, teste com fetch mockado). Usar sempre que for preciso falar com um sistema externo.
---

# Adicionar / evoluir uma integração externa

Lê primeiro [`docs/integrations.md`](../../../docs/integrations.md). **Referência viva:**
`infrastructure/integrations/exchangeRate/ExchangeRateClient.ts` + a sua interface
`application/interfaces/integrations/IExchangeRateProvider.ts`. Copia esse padrão.

> Caminhos relativos a `apps/api/`. Substitui `Foo` pelo fornecedor real (ex.: `Stripe`,
> `Kyc`). Regra de ouro: **a application depende de uma interface; o fornecedor concreto
> vive na infrastructure e nunca deixa vazar os seus modelos crus.**

---

## A. Nova integração (fornecedor novo)

### 1. Contrato (application)
Cria `src/application/interfaces/integrations/IFooProvider.ts`:
- expõe **só** as operações de negócio necessárias;
- devolve **tipos de domínio limpos** (não o formato cru do fornecedor);
- define esses tipos aqui (ex.: `ReferenceRate`, `PaymentResult`).

### 2. Settings (config)
- Acrescenta as variáveis ao `.env.example` e a `apps/api/.env` (ex.: `FOO_API_URL`,
  `FOO_API_KEY`).
- Valida-as em `src/config/env.ts` (Zod). Se a app deve arrancar sem elas, usa `.default()`.

### 3. Modelos crus (infrastructure)
Cria `src/infrastructure/integrations/foo/models/fooApi.ts` com os tipos que refletem o
**formato exato** da API do fornecedor. **Não saem desta pasta.**

### 4. Cliente (infrastructure)
Cria `src/infrastructure/integrations/foo/FooClient.ts`:
- `extends HttpIntegrationClient implements IFooProvider`;
- no construtor, chama `super('foo', { baseUrl, defaultHeaders: { ...auth }, timeoutMs })`;
- cada método usa `this.get/post/put`, recebe o modelo cru e **mapeia** para o tipo de
  domínio da interface;
- não trata erros HTTP à mão — a base lança `IntegrationError` em respostas não-OK.

### 5. Registo no composition root (OBRIGATÓRIO)
Em `src/composition/container.ts`:
- instancia `const fooProvider = new FooClient(env.FOO_API_URL, env.FOO_API_KEY);`
- injeta-o nos serviços que o consomem e/ou expõe-o em `integrations: { fooProvider }`.

### 6. Consumir
Injeta `IFooProvider` num **serviço da application** (nunca num controller). O serviço
orquestra: chama o fornecedor, persiste se preciso, devolve `Response<T>`, e converte
`IntegrationError` em `Response.fail`.

### 7. Teste (OBRIGATÓRIO)
Cria `tests/unit/infrastructure/integrations/FooClient.test.ts` mockando o `fetch` global:
verifica o mapeamento da resposta e que respostas não-OK lançam `IntegrationError`.
(Ver skill `write-tests`.)

---

## B. Nova rota / operação numa integração existente

Quando o fornecedor já existe e só precisas de mais uma operação (ex.: além de
`createPayment`, agora `getPaymentStatus`):

1. **Contrato:** acrescenta o método à interface `IFooProvider` (com o tipo de domínio que
   devolve).
2. **Modelo cru:** se a nova rota tem um formato de resposta diferente, acrescenta o tipo em
   `infrastructure/integrations/foo/models/`.
3. **Implementação:** acrescenta o método ao `FooClient` (`this.get/post(...)` + mapeamento).
4. **Consumo:** usa o novo método no serviço da application que dele precisa.
5. **Teste:** acrescenta um caso a `FooClient.test.ts` (mapeamento + erro).

> Não é preciso mexer no `container.ts` — o cliente já está registado.

---

## Webhooks (callback do fornecedor)

Se a integração chama de volta (ex.: confirmação de pagamento):
- Endpoint = rota na `presentation` (controller fino), normalmente sem auth de utilizador
  mas com **validação da assinatura/segredo** do fornecedor.
- O controller delega num serviço da `application`. Sem lógica de negócio no handler.
- Regista a rota em `apiRoutes` e no `server.ts`.

---

## Validar
```bash
bun run typecheck
bun run lint
bun run test
```

## Checklist
- [ ] Interface `IFooProvider` na application (devolve tipos de domínio)
- [ ] Settings no `.env.example` + validação em `config/env.ts`
- [ ] Modelos crus isolados em `integrations/foo/models/`
- [ ] `FooClient` estende `HttpIntegrationClient` e implementa a interface
- [ ] Registado/instanciado no `composition/container.ts` (fluxo A)
- [ ] Consumido por um serviço da application (não pelo controller)
- [ ] Teste com `fetch` mockado (mapeamento + `IntegrationError`)
- [ ] `typecheck` + `lint` + `test` ok
