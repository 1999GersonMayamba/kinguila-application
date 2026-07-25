<script setup lang="ts">
import BaseBadge from '@/shared/components/BaseBadge.vue';
import BaseButton from '@/shared/components/BaseButton.vue';
import BaseInput from '@/shared/components/BaseInput.vue';
import BaseModal from '@/shared/components/BaseModal.vue';
import BaseTable from '@/shared/components/BaseTable.vue';
import type { AdminUserResponse } from '@kinguila/contracts';
import { computed, onMounted, ref, watch } from 'vue';
import { useUserAdmin } from '../composables/useUserAdmin';

const {
  items,
  total,
  page,
  pageSize,
  loading,
  error,
  load,
  applySearch,
  goToPage,
  save,
  setDisabled,
  resetPassword,
} = useUserAdmin();

const columns = [
  { key: 'name', label: 'Nome' },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Estado' },
  { key: 'actions', label: '' },
];

const searchInput = ref('');
let debounce: ReturnType<typeof setTimeout> | undefined;
watch(searchInput, (term) => {
  clearTimeout(debounce);
  debounce = setTimeout(() => applySearch(term.trim()), 300);
});

const editing = ref<AdminUserResponse | null>(null);
const editName = ref('');
const saving = ref(false);
const resetDoneId = ref<string | null>(null);

const pageInfo = computed(() => {
  const totalPages = Math.max(Math.ceil(total.value / pageSize), 1);
  return { totalPages };
});

function openEdit(user: AdminUserResponse) {
  editing.value = user;
  editName.value = user.name;
}

async function onSave() {
  if (!editing.value) return;
  saving.value = true;
  const ok = await save(editing.value.id, { name: editName.value });
  saving.value = false;
  if (ok) editing.value = null;
}

async function onReset(user: AdminUserResponse) {
  const ok = await resetPassword(user.id);
  if (ok) {
    resetDoneId.value = user.id;
    setTimeout(() => {
      if (resetDoneId.value === user.id) resetDoneId.value = null;
    }, 2000);
  }
}

onMounted(load);
</script>

<template>
  <div class="users">
    <div class="users__toolbar">
      <BaseInput v-model="searchInput" label="" placeholder="Pesquisar por email…" accent="green" />
    </div>

    <p v-if="error && !editing" class="users__error">{{ error }}</p>

    <BaseTable :columns="columns" :loading="loading" :empty="items.length === 0" empty-text="Sem utilizadores.">
      <tr v-for="u in items" :key="u.id">
        <td class="cell">{{ u.name }}</td>
        <td class="cell">{{ u.email }}</td>
        <td class="cell">
          <BaseBadge :variant="u.disabledAt ? 'danger' : 'success'">
            {{ u.disabledAt ? 'Desativada' : 'Ativa' }}
          </BaseBadge>
        </td>
        <td class="cell cell--actions">
          <BaseButton variant="ghost" @click="openEdit(u)">Editar</BaseButton>
          <BaseButton variant="ghost" @click="setDisabled(u.id, !u.disabledAt)">
            {{ u.disabledAt ? 'Reativar' : 'Desativar' }}
          </BaseButton>
          <BaseButton variant="ghost" @click="onReset(u)">
            {{ resetDoneId === u.id ? 'Email enviado ✓' : 'Reset senha' }}
          </BaseButton>
        </td>
      </tr>
    </BaseTable>

    <div class="users__pager">
      <BaseButton variant="ghost" :disabled="page <= 1 || loading" @click="goToPage(page - 1)">
        ‹ Anterior
      </BaseButton>
      <span class="users__page">{{ page }} / {{ pageInfo.totalPages }}</span>
      <BaseButton
        variant="ghost"
        :disabled="page >= pageInfo.totalPages || loading"
        @click="goToPage(page + 1)"
      >
        Seguinte ›
      </BaseButton>
    </div>

    <BaseModal :open="editing !== null" title="Editar utilizador" @close="editing = null">
      <BaseInput v-model="editName" label="Nome" accent="green" required />
      <template #footer>
        <BaseButton variant="ghost" :disabled="saving" @click="editing = null">Cancelar</BaseButton>
        <BaseButton variant="success" :disabled="saving" @click="onSave">
          {{ saving ? 'A guardar…' : 'Guardar' }}
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.users__toolbar {
  margin-bottom: 1rem;
  max-width: 22rem;
}
.cell {
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid var(--k-gray-100);
  color: var(--k-navy);
}
.cell--actions {
  display: flex;
  gap: 0.25rem;
  justify-content: flex-end;
  flex-wrap: wrap;
}
.users__error {
  margin: 0 0 0.75rem;
  font-size: 0.85rem;
  color: #d4183d;
}
.users__pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}
.users__page {
  font-size: 0.85rem;
  color: var(--k-gray-500);
}
</style>
