<script setup lang="ts">
import BaseButton from '@/shared/components/BaseButton.vue';
import { RouterLink } from 'vue-router';

// Navegação de topo (PC): links horizontais ao lado da marca.
defineProps<{ authenticated: boolean; userName?: string }>();
defineEmits<{ logout: [] }>();
</script>

<template>
  <nav class="nav-desktop">
    <template v-if="authenticated">
      <span class="nav-desktop__user">Olá, {{ userName }}</span>
      <BaseButton variant="ghost" @click="$emit('logout')">Sair</BaseButton>
    </template>
    <template v-else>
      <RouterLink :to="{ name: 'login' }">Entrar</RouterLink>
      <RouterLink :to="{ name: 'register' }">Criar conta</RouterLink>
    </template>
  </nav>
</template>

<style scoped>
.nav-desktop {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.nav-desktop__user {
  color: var(--k-gray-700);
}
</style>
