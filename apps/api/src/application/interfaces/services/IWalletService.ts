import type { SetListedAmountRequest, WalletBalanceResponse } from '@kinguila/contracts';
import type { Response } from '../../common/Response';

export interface IWalletService {
  /** Saldos (por moeda) do utilizador autenticado. */
  getMyWallet(userId: string): Promise<Response<WalletBalanceResponse[]>>;
  /** Define o montante exposto para venda numa moeda do utilizador. */
  setListedAmount(
    userId: string,
    currency: string,
    request: SetListedAmountRequest,
  ): Promise<Response<WalletBalanceResponse>>;
}
