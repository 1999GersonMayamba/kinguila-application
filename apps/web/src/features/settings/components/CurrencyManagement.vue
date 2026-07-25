<script setup lang="ts">
import BaseBadge from '@/shared/components/BaseBadge.vue';
import BaseButton from '@/shared/components/BaseButton.vue';
import BaseInput from '@/shared/components/BaseInput.vue';
import BaseMenu from '@/shared/components/BaseMenu.vue';
import BaseMenuItem from '@/shared/components/BaseMenuItem.vue';
import BaseModal from '@/shared/components/BaseModal.vue';
import BaseTable from '@/shared/components/BaseTable.vue';
import BaseToggle from '@/shared/components/BaseToggle.vue';
import type { CurrencyResponse } from '@kinguila/contracts';
import { Pencil, Trash2 } from 'lucide-vue-next';
import { onMounted, reactive, ref } from 'vue';
import { useCurrencyAdmin } from '../composables/useCurrencyAdmin';

const { items, loading, error, busyCode, load, save, toggleEnabled } = useCurrencyAdmin();

const columns = [
  { key: 'code', label: 'Código' },
  { key: 'name', label: 'Nome' },
  { key: 'symbol', label: 'Símbolo' },
  { key: 'enabled', label: 'Ativa' },
  { key: 'actions', label: '' },
];

const editing = ref<CurrencyResponse | null>(null);
const form = reactive({ name: '', symbol: '', icon: '' });
const saving = ref(false);
const saveError = ref<string | null>(null);

// Confirmação antes de desativar/eliminar uma moeda.
const confirmingDisable = ref<CurrencyResponse | null>(null);

/** Ativar é imediato; desativar pede confirmação primeiro. */
function onToggle(currency: CurrencyResponse, value: boolean) {
  if (value) {
    toggleEnabled(currency.code, true);
  } else {
    confirmingDisable.value = currency;
  }
}

async function confirmDisable() {
  const currency = confirmingDisable.value;
  if (!currency) return;
  confirmingDisable.value = null;
  await toggleEnabled(currency.code, false);
}

function openEdit(currency: CurrencyResponse) {
  editing.value = currency;
  form.name = currency.name;
  form.symbol = currency.symbol;
  form.icon = currency.icon ?? '';
  saveError.value = null;
}

async function onSave() {
  if (!editing.value) return;
  saving.value = true;
  saveError.value = null;
  const ok = await save(editing.value.code, {
    name: form.name,
    symbol: form.symbol,
    icon: form.icon || null,
  });
  saving.value = false;
  if (ok) {
    editing.value = null;
  } else {
    saveError.value = error.value;
  }
}

onMounted(load);
</script>

<template>
  <div class="currency">
    <p v-if="error && !editing" class="currency__error">{{ error }}</p>

    <BaseTable :columns="columns" :loading="loading" :empty="items.length === 0" empty-text="Sem moedas.">
      <tr v-for="c in items" :key="c.code">
        <td class="cell">{{ c.code }}</td>
        <td class="cell">{{ c.name }}</td>
        <td class="cell">{{ c.symbol }}</td>
        <td class="cell">
          <BaseToggle
            :model-value="c.enabled"
            :disabled="busyCode === c.code"
            :label="`Ativar ${c.code}`"
            @update:model-value="(value) => onToggle(c, value)"
          />
        </td>
        <td class="cell cell--menu">
          <BaseMenu>
            <BaseMenuItem @click="openEdit(c)">
              <template #icon><Pencil :size="16" /></template>
              Editar
            </BaseMenuItem>
            <BaseMenuItem
              v-if="c.enabled"
              danger
              :disabled="busyCode === c.code"
              @click="confirmingDisable = c"
            >
              <template #icon><Trash2 :size="16" /></template>
              Eliminar
            </BaseMenuItem>
          </BaseMenu>
        </td>
      </tr>
    </BaseTable>

    <BaseModal :open="editing !== null" :title="`Editar ${editing?.code ?? ''}`" @close="editing = null">
      <BaseInput v-model="form.name" label="Nome" accent="green" required />
      <BaseInput v-model="form.symbol" label="Símbolo" accent="green" required />
      <BaseInput v-model="form.icon" label="Ícone (chave ou URL)" accent="green" />
      <BaseBadge v-if="editing" :variant="editing.enabled ? 'success' : 'neutral'">
        {{ editing.enabled ? 'Ativa' : 'Desativada' }}
      </BaseBadge>
      <p v-if="saveError" class="currency__error">{{ saveError }}</p>

      <template #footer>
        <BaseButton variant="ghost" :disabled="saving" @click="editing = null">Cancelar</BaseButton>
        <BaseButton variant="success" :disabled="saving" @click="onSave">
          {{ saving ? 'A guardar…' : 'Guardar' }}
        </BaseButton>
      </template>
    </BaseModal>

    <!-- Confirmação antes de desativar/eliminar uma moeda -->
    <BaseModal
      :open="confirmingDisable !== null"
      :title="`Eliminar ${confirmingDisable?.code ?? ''}`"
      @close="confirmingDisable = null"
    >
      <p class="currency__confirm">
        Tens a certeza que queres desativar a moeda
        <strong>{{ confirmingDisable?.code }}</strong>? Deixa de aparecer para novas ofertas.
        Não é apagada permanentemente — podes reativá-la mais tarde.
      </p>
      <template #footer>
        <BaseButton variant="ghost" @click="confirmingDisable = null">Cancelar</BaseButton>
        <BaseButton variant="danger" @click="confirmDisable">Desativar</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.cell {
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid var(--k-gray-100);
  color: var(--k-green-dark);
}
.cell--menu {
  text-align: right;
}
.currency__error {
  margin: 0 0 0.75rem;
  font-size: 0.85rem;
  color: #d4183d;
}
.currency__confirm {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--k-gray-600);
}
</style>
