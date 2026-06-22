import { getAccessToken, setAccessToken } from '@/shared/api/httpClient';
import type { AuthResponse, AuthUser, LoginRequest, RegisterRequest } from '@kinguila/contracts';
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
  }

  async function register(payload: RegisterRequest) {
    applyAuth(await authService.register(payload));
  }

  async function login(payload: LoginRequest) {
    applyAuth(await authService.login(payload));
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

  function logout() {
    user.value = null;
    setAccessToken(null);
  }

  return { user, isAuthenticated, register, login, restore, logout };
});
