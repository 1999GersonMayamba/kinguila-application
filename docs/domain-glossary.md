# Glossário de Domínio (Linguagem Ubíqua)

Vocabulário partilhado entre produto, código e documentação. **Usa estes termos** em
entidades, variáveis e conversas. No código usamos o termo em **inglês** (coluna "Código");
em português usamos o termo da coluna "Termo".

| Termo (PT)        | Código (EN)     | Definição                                                                 |
| ----------------- | --------------- | ------------------------------------------------------------------------- |
| Divisa / Moeda    | `Currency`      | Moeda transacionável na plataforma (ex.: BRL, AOA/Kz, USD, EUR).          |
| Código de moeda   | `CurrencyCode`  | Código ISO-4217 da moeda (`BRL`, `AOA`, `USD`, `EUR`).                     |
| Utilizador        | `User`          | Pessoa registada; pode ser comprador e/ou vendedor.                       |
| Papel             | `Role`          | Perfil de autorização (`admin`, `user`).                                  |
| Oferta            | `Offer`         | Anúncio de um vendedor: disponibiliza uma divisa a uma taxa e montante.   |
| Ordem / Negociação| `Order`         | Compra iniciada por um comprador sobre uma oferta. (fase futura)          |
| Taxa de câmbio    | `ExchangeRate`  | Preço relativo entre a moeda vendida e a comprada.                        |
| Par de moedas     | `CurrencyPair`  | Combinação "vende X / compra Y" (ex.: vende AOA, recebe BRL).             |
| Montante          | `amount`        | Quantia numa dada moeda.                                                   |
| Custódia / Escrow | `Escrow`        | Retenção do valor pela plataforma até a troca concluir. (fase futura)     |
| Carteira          | `Wallet`        | Saldo do utilizador por moeda. (fase futura)                              |
| KYC               | `Kyc`           | Verificação de identidade do utilizador. (fase futura)                    |

## Estados (enums)

### `OfferStatus`
- `active` — oferta publicada e disponível.
- `paused` — temporariamente indisponível (pelo vendedor).
- `completed` — totalmente consumida.
- `cancelled` — cancelada pelo vendedor.

### `OrderStatus` (fase futura)
- `pending` — criada, à espera de pagamento.
- `paid` — comprador marcou pagamento.
- `released` — vendedor libertou a divisa.
- `completed` — concluída.
- `disputed` — em disputa.
- `cancelled` — cancelada.

## Regras de negócio iniciais

- Uma `Offer` tem moeda **vendida** (`sellCurrency`) e moeda **recebida** (`buyCurrency`),
  uma `exchangeRate`, e um `availableAmount` (na moeda vendida).
- `sellCurrency` e `buyCurrency` têm de ser diferentes e ambas suportadas.
- `exchangeRate` e `availableAmount` têm de ser > 0.
- Só ofertas `active` aparecem nas pesquisas de compradores.
- Montantes monetários guardam-se com precisão (decimal/numeric), nunca em `float`.
