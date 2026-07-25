<script setup lang="ts">
import { useAuthStore } from '@/features/auth/stores/auth.store';
import KLogo from '@/shared/components/KLogo.vue';
import {
  ArrowLeftRight,
  HelpCircle,
  Home,
  LayoutGrid,
  LogOut,
  Settings,
  Tag,
  User,
  Wallet,
} from 'lucide-vue-next';
import type { Component } from 'vue';
import { computed } from 'vue';
import { RouterLink, RouterView, useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

interface NavLink {
  name: string;
  label: string;
  icon: Component;
}
interface NavSoon {
  label: string;
  icon: Component;
}

// Navegação principal (ordem do Figma). Só as rotas existentes são clicáveis;
// as ainda não construídas aparecem esbatidas ("em breve").
const mainNav: NavLink[] = [
  { name: 'home', label: 'Início', icon: Home },
  { name: 'offers', label: 'Marketplace', icon: LayoutGrid },
];
const mainSoon: NavSoon[] = [
  { label: 'Operações', icon: ArrowLeftRight },
  { label: 'Carteira', icon: Wallet },
  { label: 'Minhas ofertas', icon: Tag },
  { label: 'Perfil', icon: User },
];
const footNav: NavLink[] = [{ name: 'settings', label: 'Configurações', icon: Settings }];
const footSoon: NavSoon[] = [{ label: 'Ajuda', icon: HelpCircle }];

// Barra inferior (telemóvel): itens principais que existem.
const mobileNav: NavLink[] = [
  { name: 'home', label: 'Início', icon: Home },
  { name: 'offers', label: 'Mercado', icon: LayoutGrid },
  { name: 'settings', label: 'Config.', icon: Settings },
];

const initials = computed(() => {
  const name = auth.user?.name?.trim();
  if (!name) return 'U';
  return name
    .split(/\s+/)
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
});
const firstName = computed(() => auth.user?.name?.split(/\s+/)[0] ?? 'utilizador');

async function onLogout() {
  await auth.logout();
  router.push({ name: 'login' });
}
</script>

<template>
  <div class="shell">
    <!-- Sidebar (PC, ≥1024px) — barra lateral verde do Figma -->
    <aside class="shell__sidebar">
      <RouterLink :to="{ name: 'home' }" class="shell__brand">
        <KLogo :size="30" with-wordmark subtitle light />
      </RouterLink>

      <span class="shell__section">Menu</span>
      <nav class="shell__nav">
        <RouterLink
          v-for="item in mainNav"
          :key="item.name"
          :to="{ name: item.name }"
          class="shell__link"
          active-class="shell__link--active"
        >
          <component :is="item.icon" :size="18" :stroke-width="1.75" />
          <span>{{ item.label }}</span>
        </RouterLink>
        <span
          v-for="item in mainSoon"
          :key="item.label"
          class="shell__link shell__link--soon"
          title="Em breve"
        >
          <component :is="item.icon" :size="18" :stroke-width="1.75" />
          <span>{{ item.label }}</span>
        </span>
      </nav>

      <div class="shell__foot">
        <RouterLink
          v-for="item in footNav"
          :key="item.name"
          :to="{ name: item.name }"
          class="shell__link"
          active-class="shell__link--active"
        >
          <component :is="item.icon" :size="18" :stroke-width="1.75" />
          <span>{{ item.label }}</span>
        </RouterLink>
        <span
          v-for="item in footSoon"
          :key="item.label"
          class="shell__link shell__link--soon"
          title="Em breve"
        >
          <component :is="item.icon" :size="18" :stroke-width="1.75" />
          <span>{{ item.label }}</span>
        </span>
        <button type="button" class="shell__link shell__logout" @click="onLogout">
          <LogOut :size="18" :stroke-width="1.75" />
          <span>Sair</span>
        </button>
      </div>
    </aside>

    <!-- Conteúdo -->
    <div class="shell__main">
      <header class="shell__topbar">
        <RouterLink :to="{ name: 'home' }" class="shell__topbar-brand">
          <KLogo :size="26" with-wordmark />
        </RouterLink>
        <div class="shell__user">
          <span class="shell__hello">Olá, {{ firstName }}</span>
          <div class="shell__avatar" :title="auth.user?.name ?? 'Utilizador'">{{ initials }}</div>
        </div>
      </header>
      <main class="shell__content">
        <RouterView />
      </main>
    </div>

    <!-- Bottom tab bar (telemóvel, <1024px) -->
    <nav class="shell__bottom">
      <RouterLink
        v-for="item in mobileNav"
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
.shell__user {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}
.shell__hello {
  font-size: 0.85rem;
  color: var(--k-gray-500);
}
.shell__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: var(--k-green);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  flex-shrink: 0;
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
    gap: 0.15rem;
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
    gap: 0.15rem;
    flex: 1;
  }
  .shell__foot {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    padding-top: 0.75rem;
    margin-top: 0.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
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
  .shell__link--soon {
    color: rgba(255, 255, 255, 0.35);
    cursor: default;
  }
  .shell__link--soon:hover {
    background: none;
  }
  .shell__logout {
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
