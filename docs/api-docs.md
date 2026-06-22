# Documentação da API (OpenAPI + Swagger UI)

A API expõe um documento **OpenAPI 3.0** e uma **Swagger UI** interativa:

| Recurso      | URL (dev)                       |
| ------------ | ------------------------------- |
| Swagger UI   | http://localhost:3333/docs      |
| OpenAPI JSON | http://localhost:3333/openapi.json |

## Regra (não negociável)

**Toda rota criada tem de ser documentada.** Uma rota só está "pronta" quando aparece na
Swagger UI com request e respostas corretas. Está incluído no checklist da skill
`add-entity`.

## Como funciona (Opção B — não invasiva)

Mantemos os controllers finos e as rotas centralizadas em `apiRoutes`. A documentação é uma
**camada à parte** que reaproveita os schemas Zod (os mesmos dos validators) via
`@asteasolutions/zod-to-openapi`. O Hono continua isolado na `presentation`.

```
presentation/http/openapi/
├── zod.ts            # z estendido com .openapi()
├── schemas.ts        # envelope ApiResponse + schemas de resposta + tags
├── registry.ts       # cria o OpenAPIRegistry + esquema de auth Bearer
├── util.ts           # toOpenApiPath ( :id → {id} )
├── paths/
│   ├── auth.docs.ts      # regista as rotas de auth   (espelha auth.routes.ts)
│   ├── currency.docs.ts  # regista as rotas de moedas (espelha currency.routes.ts)
│   └── offer.docs.ts     # regista as rotas de ofertas (espelha offer.routes.ts)
└── document.ts       # junta tudo e gera o documento OpenAPI
```

O documento é gerado **uma vez no arranque** (`server.ts`) e servido em `/openapi.json`; a
Swagger UI consome esse JSON.

## Como documentar uma rota nova

1. **Request:** reutiliza o schema Zod do validator da rota (`*.validators.ts`) para
   `request.body` / `request.query` / `request.params`.
2. **Resposta:** usa `apiResponseSchema(<schema de data>)`. Se o tipo de `data` ainda não
   existir, adiciona um schema de resposta em `openapi/schemas.ts` (espelha o DTO de
   `packages/contracts`).
3. **Registo:** acrescenta um `registry.registerPath({...})` no `*.docs.ts` da feature
   (cria o ficheiro se a feature for nova e regista-o em `document.ts`).
   - `tags`: agrupa na UI.
   - `security: [{ [bearerAuthName]: [] }]` nas rotas protegidas por JWT.
   - paths com parâmetro: usa `toOpenApiPath(apiRoutes.x.y)` e `request.params`.
4. **Confirma:** arranca a API e vê a rota em `/docs`.

## Convenção

- Um ficheiro `*.docs.ts` por feature, a **espelhar** o respetivo `*.routes.ts`.
- Os schemas de resposta vivem em `openapi/schemas.ts` (camada de documentação; mantém-nos
  alinhados com `packages/contracts`).
