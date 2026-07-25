<script setup lang="ts">
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useBreakpoints } from '@/shared/composables/useBreakpoints';
import { RouterLink, RouterView, useRouter } from 'vue-router';
import AppNavDesktop from './components/AppNavDesktop.vue';
import AppNavMobile from './components/AppNavMobile.vue';

const auth = useAuthStore();
const router = useRouter();
// Escape hatch: a navegação muda de ESTRUTURA entre telemóvel e PC (topo vs barra inferior).
const { isMobile } = useBreakpoints();

function logout() {
  auth.logout();
  router.push({ name: 'login' });
}
</script>

<template>
  <div class="layout" :class="{ 'layout--mobile': isMobile }">
    <header class="layout__bar">
      <RouterLink :to="{ name: 'offers' }" class="layout__brand">Kinguila</RouterLink>
      <!-- PC: navegação no topo, ao lado da marca. -->
      <AppNavDesktop
        v-if="!isMobile"
        :authenticated="auth.isAuthenticated"
        :user-name="auth.user?.name"
        @logout="logout"
      />
    </header>

    <main class="layout__content">
      <RouterView />
    </main>

    <!-- Telemóvel: navegação numa barra inferior fixa (estrutura diferente do PC). -->
    <AppNavMobile v-if="isMobile" :authenticated="auth.isAuthenticated" @logout="logout" />
  </div>
</template>

<style scoped>
/* Mobile-first: estilos base = telemóvel. */
.layout__bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--k-gray-200);
}
.layout__brand {
  font-weight: 700;
  font-size: 1.2rem;
  text-decoration: none;
  color: var(--k-blue);
}
.layout__content {
  padding: 1.25rem;
}
/* Deixa espaço para a barra de navegação inferior fixa do telemóvel. */
.layout--mobile .layout__content {
  padding-bottom: 5rem;
}

/* Desktop (>= md / 768px): conteúdo centrado e largo, mais espaçamento. */
@media (min-width: 768px) {
  .layout__bar {
    padding: 1rem 2rem;
  }
  .layout__content {
    max-width: 1080px;
    margin: 0 auto;
    padding: 2rem;
  }
}
</style>
