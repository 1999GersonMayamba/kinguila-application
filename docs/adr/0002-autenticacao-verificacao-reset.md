# ADR 0002 — Verificação de conta por email e reset de senha

- **Estado:** Aceite
- **Data:** 2026-06-22
- **Relacionado:** [ADR 0001](0001-stack-e-arquitetura.md), [plano](../plans/2026-06-22-001-feat-auth-email-verification-password-reset-plan.md)

## Contexto

O módulo Identity próprio (ADR 0001) emitia tokens JWT imediatamente no registo e não
distinguia contas confirmadas das não confirmadas. Precisávamos de (1) confirmar a posse do
email antes de dar acesso e (2) permitir recuperar acesso por reset de senha. O envio de
email é feito via Resend, seguindo o padrão de integração externa existente
(`HttpIntegrationClient` / `ExchangeRateClient`).

## Decisão

- **Estado de confirmação** como `users.email_confirmed_at` (timestamp nullable): `null` = por
  confirmar. Backfill na migration para não bloquear contas pré-existentes.
- **Duas tabelas dedicadas** — `email_verification_codes` (código de 6 dígitos) e
  `password_reset_tokens` (token opaco) — cada uma com entidade, schema e repositório
  próprios, em vez de uma tabela única com enum de tipo.
- **Hashing dos segredos (SHA-256):** só o hash do código/token é persistido, nunca o valor
  cru (mesmo princípio do `passwordHash`).
- **Código curto vs token opaco:** confirmação por código de 6 dígitos (ecrã de input);
  reset por token de 32 bytes (base64url) embutido no **fragmento** do link
  (`/reset-password#token=...`), que não vai para logs do servidor nem para o header
  `Referer`.
- **Não reutilizar o `JwtTokenService`** para confirmação/reset: o seu `verify` rejeita tudo
  o que não seja `type: 'access'`. Confirmação e reset validam contra a BD.
- **Lockout em âmbito:** `attempt_count` no código; o `confirm` bloqueia após
  `EMAIL_CODE_MAX_ATTEMPTS` tentativas falhadas. Defesa principal contra brute-force do
  código de 6 dígitos (10^6).
- **Códigos de erro legíveis por máquina** (`ACCOUNT_NOT_CONFIRMED`,
  `INVALID_OR_EXPIRED_CODE`, `CODE_LOCKED_OUT`, `INVALID_OR_EXPIRED_TOKEN`) no envelope de
  erro, para o front-end ramificar por `code` e não por texto de mensagem.
- **Anti-enumeração:** `request-password-reset` e `resend` devolvem sempre resposta genérica.
  Reconhecidamente **parcial**: o `register` continua a devolver 409 para email já
  registado, revelando existência — assumido por agora (UX de registo).
- **Validação condicional de ambiente:** `RESEND_API_KEY`/`EMAIL_FROM` obrigatórios quando
  `NODE_ENV === 'production'` (default `''` só serve para arrancar localmente).
- **Sessão — refresh + invalidação por `tokenVersion`:** o access token é curto (15 min) e
  o refresh (7 dias) é trocado por um novo par no endpoint `POST /auth/refresh`. A
  invalidação usa `users.token_version`, incluído nos claims dos dois tokens: o
  `authMiddleware` compara-o com o da BD e o `POST /auth/logout` incrementa-o, invalidando
  **instantaneamente todos** os tokens do utilizador. Optou-se por `tokenVersion` (sem tabela
  nem Redis) em vez de persistir/rotacionar refresh tokens; trade-off: logout é global (todos
  os dispositivos) e há 1 leitura à BD por pedido autenticado. No front-end o `httpClient`
  renova a sessão de forma transparente ao apanhar um 401.

## Alternativas consideradas

- **Tabela única com enum de tipo** (como na referência maya-payment-application): menos
  ficheiros, mas mistura dois ciclos de vida; preferiu-se responsabilidade única.
- **Código curto também para o reset** (`?code&email` no link): consistente com a
  confirmação, mas um código curto num link é mais fraco que um token de 32 bytes.
- **Plaintext dos códigos** (como a referência): mais fácil de debugar, mas expõe códigos
  válidos em caso de leak da BD.

## Consequências

- O `register` deixa de autenticar: devolve `verificationRequired` sem tokens; o front-end
  encaminha para o ecrã de verificação. A ação `register` da store e o `useAuthForm` foram
  ajustados em conformidade.
- A confirmação emite os tokens via `ITokenService` injetado no `EmailVerificationService`
  (não há delegação ao `AuthService`, evitando acoplamento/ciclo).
- Diferido para follow-up: rate-limit global por IP, job de limpeza de
  códigos/tokens expirados, e tracking de IP nos registos.
- Em aberto (ver Open Questions do plano): invalidar sessões JWT ativas no reset — não feito,
  pois o fluxo de refresh token é stateless e está fora do âmbito (não-objetivo do ADR 0001).
