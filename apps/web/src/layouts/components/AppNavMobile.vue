<script setup lang="ts">
import { Home, LogIn, LogOut, UserPlus } from 'lucide-vue-next';
import { RouterLink } from 'vue-router';

// Navegação compacta (telemóvel): barra inferior fixa — estrutura diferente do PC.
defineProps<{ authenticated: boolean }>();
defineEmits<{ logout: [] }>();
</script>

<template>
  <nav class="nav-mobile" aria-label="Navegação principal">
    <RouterLink :to="{ name: 'offers' }" class="nav-mobile__item">
      <Home :size="20" />
      <span>Ofertas</span>
    </RouterLink>

    <button
      v-if="authenticated"
      type="button"
      class="nav-mobile__item"
      @click="$emit('logout')"
    >
      <LogOut :size="20" />
      <span>Sair</span>
    </button>
    <template v-else>
      <RouterLink :to="{ name: 'login' }" class="nav-mobile__item">
        <LogIn :size="20" />
        <span>Entrar</span>
      </RouterLink>
      <RouterLink :to="{ name: 'register' }" class="nav-mobile__item">
        <UserPlus :size="20" />
        <span>Criar</span>
      </RouterLink>
    </template>
  </nav>
</template>

<style scoped>
.nav-mobile {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  padding: 0.5rem 0.75rem;
  background: var(--k-surface);
  border-top: 1px solid var(--k-border);
  box-shadow: var(--k-shadow-soft);
}
.nav-mobile__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  font-size: 0.7rem;
  color: var(--k-gray-400);
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
}
.nav-mobile__item.router-link-active {
  color: var(--k-green-dark);
}
</style>
