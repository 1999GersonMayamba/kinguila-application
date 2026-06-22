import {
  clearTokens,
  getAccessToken,
  setAccessToken,
  setRefreshToken,
} from '@/shared/api/httpClient';
import type {
  AuthResponse,
  AuthUser,
  ConfirmEmailRequest,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  RequestPasswordResetRequest,
  ResendCodeRequest,
  ResetPasswordRequest,
  ValidateResetTokenRequest,
} from '@kinguila/contracts';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { authService } from '../services/authService';

/** Estado global da sessão. É o único estado verdadeiramente partilhado da app. */
export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null);
  const isAuthenticated = computed(() => user.value !== null);

  function applyAuth(result: AuthResponse) {
    user.value = result.user;
    setAccessToken(result.tokens.accessToken);
    setRefreshToken(result.tokens.refreshToken);
  }

  /**
   * Regista a conta. NÃO autentica: a conta nasce por confirmar e não recebe
   * tokens. Devolve a resposta para a view encaminhar para a verificação.
   */
  async function register(payload: RegisterRequest): Promise<RegisterResponse> {
    return authService.register(payload);
  }

  async function login(payload: LoginRequest) {
    applyAuth(await authService.login(payload));
  }

  /** Confirma a conta com o código; só aqui se obtêm e guardam os tokens. */
  async function confirmEmail(payload: ConfirmEmailRequest) {
    applyAuth(await authService.confirmEmail(payload));
  }

  function resendCode(payload: ResendCodeRequest) {
    return authService.resendCode(payload);
  }

  function requestPasswordReset(payload: RequestPasswordResetRequest) {
    return authService.requestPasswordReset(payload);
  }

  function validateResetToken(payload: ValidateResetTokenRequest) {
    return authService.validateResetToken(payload);
  }

  function resetPassword(payload: ResetPasswordRequest) {
    return authService.resetPassword(payload);
  }

  /** Restaura a sessão a partir do token guardado (ex.: ao recarregar a página). */
  async function restore() {
    if (!getAccessToken()) return;
    try {
      user.value = await authService.me();
    } catch {
      logout();
    }
  }

  /** Termina a sessão: revoga no servidor (best-effort) e limpa o estado local. */
  async function logout() {
    try {
      await authService.logout();
    } catch {
      // Mesmo que a chamada falhe (ex.: token já expirado), limpamos localmente.
    }
    user.value = null;
    clearTokens();
  }

  return {
    user,
    isAuthenticated,
    register,
    login,
    confirmEmail,
    resendCode,
    requestPasswordReset,
    validateResetToken,
    resetPassword,
    restore,
    logout,
  };
});
