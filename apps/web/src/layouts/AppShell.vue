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
    <!-- Sidebar (PC, ≥1024px) — barra lateral verde escura do Figma -->
    <aside class="shell__sidebar">
      <RouterLink :to="{ name: 'home' }" class="shell__brand">
        <KLogo :size="30" with-wordmark light />
      </RouterLink>
      <span class="shell__section">Menu</span>
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
        <RouterLink :to="{ name: 'home' }" class="shell__topbar-brand">
          <KLogo :size="26" with-wordmark />
        </RouterLink>
        <span class="shell__hello">Olá, {{ auth.user?.name ?? 'utilizador' }}</span>
      </header>
      <main class="shell__content">
        <RouterView />
      </main>
    </div>

    <!-- Bottom tab bar (telemóvel, <1024px) -->
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
/* Mobile-first: base = telemóvel (sidebar escondida, bottom bar visível). */
.shell {
  min-height: 100vh;
  display: flex;
  background: var(--k-page-mobile);
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
  justify-content: space-between;
  padding: 0.85rem 1.25rem;
  background: var(--k-surface);
  border-bottom: 1px solid var(--k-border);
}
.shell__hello {
  font-size: 0.85rem;
  color: var(--k-gray-500);
}
.shell__content {
  flex: 1;
  padding: 1.25rem;
  padding-bottom: 5rem; /* espaço para a bottom bar */
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
}

/* Bottom tab bar (telemóvel) */
.shell__bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  background: var(--k-surface);
  border-top: 1px solid var(--k-border);
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
  color: var(--k-green-dark);
}

/* PC (≥1024px = lg, decisão de shell): sidebar visível, bottom bar escondida. */
@media (min-width: 1024px) {
  .shell {
    background: var(--k-page);
  }
  .shell__sidebar {
    display: flex;
    flex-direction: column;
    width: 15rem;
    background: var(--k-green-dark);
    padding: 1.5rem 0.85rem;
    gap: 0.25rem;
  }
  .shell__brand {
    padding: 0.35rem 0.5rem;
    margin-bottom: 1.25rem;
  }
  .shell__section {
    padding: 0 0.75rem;
    margin-bottom: 0.5rem;
    font-size: 0.65rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.3);
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
    padding: 0.65rem 0.75rem;
    border-radius: var(--k-radius-xl);
    color: rgba(255, 255, 255, 0.75);
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 500;
    background: none;
    border: none;
    cursor: pointer;
    width: 100%;
    font-family: var(--k-font);
    transition: background 0.15s ease, color 0.15s ease;
  }
  .shell__link:hover {
    background: rgba(255, 255, 255, 0.07);
  }
  .shell__link--active {
    background: rgba(31, 175, 117, 0.18);
    color: var(--k-green);
    font-weight: 600;
  }
  .shell__logout {
    margin-top: 0.25rem;
    color: rgba(255, 120, 100, 0.85);
  }
  .shell__logout:hover {
    background: rgba(255, 100, 80, 0.1);
  }
  /* No PC a marca vive na sidebar; esconde a do topbar. */
  .shell__topbar-brand {
    display: none;
  }
  .shell__topbar {
    justify-content: flex-end;
    padding: 1rem 2rem;
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
