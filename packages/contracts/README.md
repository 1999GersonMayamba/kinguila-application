# @kinguila/contracts

Tipos/DTOs **partilhados** entre o back-end (`apps/api`) e o front-end (`apps/web`).

- **Só tipos.** Nada de lógica, dependências de runtime ou I/O.
- Define os _Requests_ e _Responses_ da API, o envelope `ApiResponse<T>` e os enums de
  domínio expostos à UI.
- Importado como `@kinguila/contracts` em ambos os apps.

```ts
import type { OfferResponse, CreateOfferRequest } from '@kinguila/contracts';
```

Ao alterar um contrato, atualiza ambos os lados. Estes tipos são a "fonte da verdade" da
fronteira HTTP.
