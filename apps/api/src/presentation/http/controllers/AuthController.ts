import type { LoginRequest, RegisterRequest } from '@kinguila/contracts';
import type { IAuthService } from '../../../application/interfaces/services/IAuthService';
import { toHttp } from '../helpers/toHttp';
import { validated } from '../middlewares/validate';
import type { AppContext } from '../types';

/** Controller fino: extrai input validado, chama o serviço, devolve toHttp. */
export class AuthController {
  constructor(private readonly authService: IAuthService) {}

  register = async (c: AppContext) => {
    const body = validated<RegisterRequest>(c);
    return toHttp(c, await this.authService.register(body));
  };

  login = async (c: AppContext) => {
    const body = validated<LoginRequest>(c);
    return toHttp(c, await this.authService.login(body));
  };

  me = async (c: AppContext) => {
    return toHttp(c, await this.authService.me(c.get('userId')));
  };
}
