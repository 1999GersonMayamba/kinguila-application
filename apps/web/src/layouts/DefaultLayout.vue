<script setup lang="ts">
import { useAuthStore } from '@/features/auth/stores/auth.store';
import BaseButton from '@/shared/components/BaseButton.vue';
import { RouterLink, RouterView, useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

function logout() {
  auth.logout();
  router.push({ name: 'login' });
}
</script>

<template>
  <div class="layout">
    <header class="layout__bar">
      <RouterLink :to="{ name: 'offers' }" class="layout__brand">Kinguila</RouterLink>
      <nav class="layout__nav">
        <template v-if="auth.isAuthenticated">
          <span>Olá, {{ auth.user?.name }}</span>
          <BaseButton variant="ghost" @click="logout">Sair</BaseButton>
        </template>
        <template v-else>
          <RouterLink :to="{ name: 'login' }">Entrar</RouterLink>
          <RouterLink :to="{ name: 'register' }">Criar conta</RouterLink>
        </template>
      </nav>
    </header>
    <main class="layout__content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.layout__bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  border-bottom: 1px solid #e1e4e8;
}
.layout__brand {
  font-weight: 700;
  font-size: 1.2rem;
  text-decoration: none;
  color: #1f6feb;
}
.layout__nav {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.layout__content {
  max-width: 1080px;
  margin: 0 auto;
  padding: 2rem;
}
</style>
