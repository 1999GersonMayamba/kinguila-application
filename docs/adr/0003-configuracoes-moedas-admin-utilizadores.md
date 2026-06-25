# ADR 0003 — Configurações: CRUD de moedas, admin de utilizadores e autorização por role

- **Estado:** Aceite
- **Data:** 2026-06-22
- **Relacionado:** [ADR 0001](0001-stack-e-arquitetura.md), [ADR 0002](0002-autenticacao-verificacao-reset.md), [plano](../plans/2026-06-22-002-feat-settings-currency-user-admin-plan.md)

## Contexto

Pré-requisitos para a futura venda de divisas: moedas geríveis, administração de utilizadores
e uma área de Configurações pós-login. Não havia CRUD de moedas (só listagem), nem área de
gestão no front-end, nem qualquer autorização por role (as roles já viajam no JWT mas ninguém
as verificava), nem forma de gerir utilizadores.

## Decisão

- **Moeda mantém o enum `CurrencyCode` fechado.** O CRUD desta fase **edita** (nome/símbolo/
  ícone) e **ativa/desativa**; não cria moedas arbitrárias (fica para a fatia de moedas livres,
  que exige desacoplar `offers` do enum). Adicionou-se a coluna `icon` (string curta/URL,
  validada, **nunca** renderizada como HTML/SVG — evita XSS).
- **"Apagar" moeda = soft-disable.** As `offers` guardam o código como texto **sem foreign
  key**; um hard-delete deixaria códigos órfãos. "Remover" define `enabled=false`.
- **Autorização por role construída mas NÃO aplicada.** `requireRole(role)` lê as roles dos
  claims e devolve 403 `FORBIDDEN_ROLE`. É exportado do seu módulo (não registado no container)
  e **não anexado** a nenhuma rota nesta fase — as rotas de gestão exigem apenas `requireAuth`.
  **Consequência/risco:** qualquer sessão autenticada acede às rotas de admin — por isso esta
  fatia **não deve ser implantada além de dev** até ligar o `requireRole` (1.ª tarefa da fase
  seguinte). Mitigação aplicada: ver abaixo.
- **`update` de utilizador NÃO altera `roles` nesta fase.** Permitir editar roles num CRUD sem
  bloqueio seria auto-promoção a admin. A edição de roles entra com o enforcement.
- **Bootstrap de admin por seed idempotente** (`ADMIN_EMAIL`/`ADMIN_PASSWORD`). É o único
  caminho para haver um admin, já que `register` só cria `client` e o `update` não mexe em roles.
- **Desativação de conta por `disabledAt`** (timestamp nullable). Desativar marca `disabledAt`
  **e incrementa `tokenVersion`** na mesma atualização (termina sessões); reativar limpa
  `disabledAt` e **nunca** repõe o `tokenVersion`. O `login` recusa contas desativadas (403
  `ACCOUNT_DISABLED`).
- **Reset de senha por admin via `requestForUser(userId)`** (novo no `PasswordResetService`):
  resolve o utilizador (404 se não existir) e envia o email de reset — distinto do `request`
  público (anti-enumeração). Não expõe senha temporária.
- **`AdminUserResponse` é um allowlist explícito** — `passwordHash`/`tokenVersion` nunca são
  expostos.
- **Front-end:** novo app-shell responsivo (sidebar no desktop ≥1024px, bottom tab bar no
  mobile <640px — primeiros breakpoints do projeto), home pós-login (estática), e área de
  Configurações com tabs de gestão de moedas (CRUD real) e de utilizadores (admin real). Nesta
  fase o menu é **visível a qualquer sessão** (pedido); o esconder por role (`useRole`) entra
  com o enforcement.

## Alternativas consideradas

- **Moedas livres já agora:** exigiria desacoplar `offers` do enum — refactor maior; adiado.
- **Reset por admin com senha temporária** (como a referência maya): mais simples mas expõe a
  senha; preferiu-se o email de reset.
- **`requireRole` aplicado já às rotas de admin:** recomendado pela revisão de segurança, mas
  o pedido foi "estrutura sem bloqueio"; mantido desligado, com o risco documentado e a
  mitigação de não implantar fora de dev + remover a edição de roles.

## Consequências

- As rotas de gestão ficam acessíveis a qualquer sessão até ao enforcement (risco assumido;
  dev-only). Ligar o `requireRole(ROLE_ADMIN)` é a primeira tarefa da fase seguinte, em conjunto
  com a edição de roles e o esconder do menu por role.
- Introduziram-se os primeiros `@media`/breakpoints do projeto — convenção a reutilizar.
- Migrations manuais (`0003`): colunas `users.disabled_at` e `currencies.icon` (ambas nullable,
  sem backfill). Seed passa a criar moedas + conta admin.
- Candidato a `/ce-compound`: forma do `requireRole`, soft-disable de moeda, `disabledAt` +
  `tokenVersion`, e a convenção de breakpoints.
