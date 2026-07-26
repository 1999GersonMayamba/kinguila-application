import type { SetListedAmountRequest } from '@kinguila/contracts';
import type { IWalletService } from '../../../application/interfaces/services/IWalletService';
import { toHttp } from '../helpers/toHttp';
import { validated } from '../middlewares/validate';
import type { AppContext } from '../types';

export class WalletController {
  constructor(private readonly walletService: IWalletService) {}

  getMine = async (c: AppContext) => {
    return toHttp(c, await this.walletService.getMyWallet(c.get('userId')));
  };

  setListedAmount = async (c: AppContext) => {
    const body = validated<SetListedAmountRequest>(c);
    return toHttp(
      c,
      await this.walletService.setListedAmount(
        c.get('userId'),
        c.req.param('currency') ?? '',
        body,
      ),
    );
  };
}
