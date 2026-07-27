import type { SetListedAmountRequest, WalletBalanceResponse } from '@kinguila/contracts';
import type { WalletBalance } from '../../domain/entities/WalletBalance';
import { isCurrencyCode } from '../../domain/enums/CurrencyCode';
import { Response } from '../common/Response';
import type { IWalletRepository } from '../interfaces/repositories/IWalletRepository';
import type { IWalletService } from '../interfaces/services/IWalletService';

export class WalletService implements IWalletService {
  constructor(private readonly wallet: IWalletRepository) {}

  async getMyWallet(userId: string): Promise<Response<WalletBalanceResponse[]>> {
    const balances = await this.wallet.findByUser(userId);
    return Response.ok(balances.map(this.toResponse));
  }

  async setListedAmount(
    userId: string,
    currency: string,
    request: SetListedAmountRequest,
  ): Promise<Response<WalletBalanceResponse>> {
    if (!isCurrencyCode(currency)) {
      return Response.fail('Moeda inválida.');
    }

    const amount = request.listedAmount;
    if (amount < 0) {
      return Response.fail('O montante exposto não pode ser negativo.');
    }

    const balance = await this.wallet.findByUserAndCurrency(userId, currency);
    if (!balance) {
      return Response.fail('Sem saldo nessa moeda.');
    }

    if (amount > balance.balance) {
      return Response.fail('Não pode expor mais do que o saldo disponível.');
    }

    const updated = await this.wallet.setListedAmount(userId, currency, amount);
    if (!updated) {
      return Response.fail('Sem saldo nessa moeda.');
    }
    return Response.ok(this.toResponse(updated), 'Montante exposto atualizado.');
  }

  private toResponse(balance: WalletBalance): WalletBalanceResponse {
    return {
      currency: balance.currency,
      balance: balance.balance,
      listedAmount: balance.listedAmount,
    };
  }
}
