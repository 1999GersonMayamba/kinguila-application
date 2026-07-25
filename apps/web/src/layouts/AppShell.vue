<script setup lang="ts">
import { useAuthStore } from '@/features/auth/stores/auth.store';
import KLogo from '@/shared/components/KLogo.vue';
import { Home, LogOut, Settings } from 'lucide-vue-next';
import { RouterLink, RouterView, useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

const navItems = [
  { name: 'home', label: 'Início', icon: Home },
  { name: 'settings', label: 'Configurações', icon: Settings },
];

async function onLogout() {
  await auth.logout();
  router.push({ name: 'login' });
}
</script>

<template>
  <div class="shell">
    <!-- Sidebar (desktop) -->
    <aside class="shell__sidebar">
      <RouterLink :to="{ name: 'home' }" class="shell__brand">
        <KLogo :size="32" with-wordmark />
      </RouterLink>
      <nav class="shell__nav">
        <RouterLink
          v-for="item in navItems"
          :key="item.name"
          :to="{ name: item.name }"
          class="shell__link"
          active-class="shell__link--active"
        >
          <component :is="item.icon" :size="18" :stroke-width="1.75" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>
      <button type="button" class="shell__link shell__logout" @click="onLogout">
        <LogOut :size="18" :stroke-width="1.75" />
        <span>Sair</span>
      </button>
    </aside>

    <!-- Conteúdo -->
    <div class="shell__main">
      <header class="shell__topbar">
        <span class="shell__hello">Olá, {{ auth.user?.name ?? 'utilizador' }}</span>
      </header>
      <main class="shell__content">
        <RouterView />
      </main>
    </div>

    <!-- Bottom tab bar (mobile) -->
    <nav class="shell__bottom">
      <RouterLink
        v-for="item in navItems"
        :key="item.name"
        :to="{ name: item.name }"
        class="shell__tab"
        active-class="shell__tab--active"
      >
        <component :is="item.icon" :size="20" :stroke-width="1.75" />
        <small>{{ item.label }}</small>
      </RouterLink>
    </nav>
  </div>
</template>

<style scoped>
.shell {
  min-height: 100vh;
  display: flex;
  background: var(--k-gray-100);
}
.shell__sidebar {
  display: none;
}
.shell__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.shell__topbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 1rem 1.5rem;
  background: #fff;
  border-bottom: 1px solid var(--k-gray-200);
}
.shell__hello {
  font-size: 0.85rem;
  color: var(--k-gray-500);
}
.shell__content {
  flex: 1;
  padding: 1.25rem;
  /* Espaço para a bottom bar em mobile. */
  padding-bottom: 5rem;
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
}

/* Bottom tab bar (mobile-first) */
.shell__bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  background: #fff;
  border-top: 1px solid var(--k-gray-200);
  padding: 0.4rem 0;
}
.shell__tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  text-decoration: none;
  color: var(--k-gray-400);
  font-size: 0.7rem;
}
.shell__tab--active {
  color: var(--k-navy);
}

/* Desktop (≥1024px): sidebar visível, bottom bar escondida. */
@media (min-width: 1024px) {
  .shell__sidebar {
    display: flex;
    flex-direction: column;
    width: 15rem;
    background: #fff;
    border-right: 1px solid var(--k-gray-200);
    padding: 1.25rem 1rem;
    gap: 0.5rem;
  }
  .shell__brand {
    padding: 0.5rem;
    margin-bottom: 1rem;
  }
  .shell__nav {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;
  }
  .shell__link {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0.6rem 0.75rem;
    border-radius: var(--k-radius-lg);
    color: var(--k-gray-600);
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 500;
    background: none;
    border: none;
    cursor: pointer;
    width: 100%;
    font-family: var(--k-font);
  }
  .shell__link--active {
    background: var(--k-gray-100);
    color: var(--k-navy);
    font-weight: 600;
  }
  .shell__logout {
    color: #d4183d;
  }
  .shell__content {
    padding: 2rem;
    padding-bottom: 2rem;
  }
  .shell__bottom {
    display: none;
  }
}
</style>
