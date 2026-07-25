import { ApiError } from '@/shared/api/httpClient';
import type { AdminUserResponse, ListUsersQuery, UpdateUserRequest } from '@kinguila/contracts';
import { ref } from 'vue';
import { userAdminService } from '../services/userAdminService';

const PAGE_SIZE = 20;

/** Estado e ações da administração de utilizadores (listagem paginada + ações). */
export function useUserAdmin() {
  const items = ref<AdminUserResponse[]>([]);
  const total = ref(0);
  const page = ref(1);
  const search = ref('');
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function load() {
    loading.value = true;
    error.value = null;
    try {
      const query: ListUsersQuery = {
        page: page.value,
        pageSize: PAGE_SIZE,
        email: search.value || undefined,
      };
      const result = await userAdminService.list(query);
      items.value = result.items;
      total.value = result.total;
    } catch (err) {
      error.value =
        err instanceof ApiError ? err.message : 'Não foi possível carregar os utilizadores.';
    } finally {
      loading.value = false;
    }
  }

  /** Aplica um novo termo de pesquisa, reiniciando para a página 1. */
  async function applySearch(term: string) {
    search.value = term;
    page.value = 1;
    await load();
  }

  async function goToPage(next: number) {
    if (next < 1 || (next - 1) * PAGE_SIZE >= total.value) return;
    page.value = next;
    await load();
  }

  async function save(id: string, payload: UpdateUserRequest): Promise<boolean> {
    try {
      replace(await userAdminService.update(id, payload));
      return true;
    } catch (err) {
      error.value = err instanceof ApiError ? err.message : 'Não foi possível guardar.';
      return false;
    }
  }

  async function setDisabled(id: string, disabled: boolean) {
    error.value = null;
    try {
      replace(await userAdminService.setDisabled(id, disabled));
    } catch (err) {
      error.value = err instanceof ApiError ? err.message : 'Não foi possível alterar o estado.';
    }
  }

  async function resetPassword(id: string): Promise<boolean> {
    try {
      await userAdminService.resetPassword(id);
      return true;
    } catch (err) {
      error.value = err instanceof ApiError ? err.message : 'Não foi possível enviar o email.';
      return false;
    }
  }

  function replace(user: AdminUserResponse) {
    items.value = items.value.map((u) => (u.id === user.id ? user : u));
  }

  return {
    items,
    total,
    page,
    search,
    pageSize: PAGE_SIZE,
    loading,
    error,
    load,
    applySearch,
    goToPage,
    save,
    setDisabled,
    resetPassword,
  };
}
