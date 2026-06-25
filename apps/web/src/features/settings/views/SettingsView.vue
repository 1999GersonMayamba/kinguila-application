<script setup lang="ts">
import BaseTabs from '@/shared/components/BaseTabs.vue';
import { ref } from 'vue';
import CurrencyManagement from '../components/CurrencyManagement.vue';
import UserManagement from '../components/UserManagement.vue';

// Nesta fase ambas as tabs são visíveis a qualquer sessão autenticada (KTD10);
// o esconder por role entra com o enforcement.
const tabs = [
  { key: 'currencies', label: 'Moedas' },
  { key: 'users', label: 'Utilizadores' },
];
const active = ref('currencies');
</script>

<template>
  <div class="settings">
    <h1 class="settings__title">Configurações</h1>
    <BaseTabs v-model="active" :tabs="tabs" />

    <section class="settings__panel">
      <CurrencyManagement v-if="active === 'currencies'" />
      <UserManagement v-else-if="active === 'users'" />
    </section>
  </div>
</template>

<style scoped>
.settings__title {
  margin: 0 0 1rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--k-navy);
}
.settings__panel {
  margin-top: 1.25rem;
}
</style>
