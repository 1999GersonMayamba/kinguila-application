<script setup lang="ts">
import BaseBadge from '@/shared/components/BaseBadge.vue';
import BaseButton from '@/shared/components/BaseButton.vue';
import BaseInput from '@/shared/components/BaseInput.vue';
import BaseModal from '@/shared/components/BaseModal.vue';
import BaseTable from '@/shared/components/BaseTable.vue';
import BaseToggle from '@/shared/components/BaseToggle.vue';
import type { CurrencyResponse } from '@kinguila/contracts';
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
            @update:model-value="(value) => toggleEnabled(c.code, value)"
          />
        </td>
        <td class="cell cell--right">
          <BaseButton variant="ghost" @click="openEdit(c)">Editar</BaseButton>
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
  </div>
</template>

<style scoped>
.cell {
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid var(--k-gray-100);
  color: var(--k-navy);
}
.cell--right {
  text-align: right;
}
.currency__error {
  margin: 0 0 0.75rem;
  font-size: 0.85rem;
  color: #d4183d;
}
</style>
