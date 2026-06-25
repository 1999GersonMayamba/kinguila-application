<script setup lang="ts">
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { ArrowLeftRight, Settings } from 'lucide-vue-next';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

// Dados estáticos (do Figma) por agora — a integração de cada card vem depois.
const cards = [
  {
    name: 'settings',
    title: 'Configurações',
    description: 'Gerir moedas, utilizadores e preferências da plataforma.',
    icon: Settings,
  },
  {
    name: 'offers',
    title: 'Ofertas',
    description: 'Explorar e publicar ofertas de câmbio.',
    icon: ArrowLeftRight,
  },
];
</script>

<template>
  <div class="home">
    <header class="home__head k-fade-up">
      <h1 class="home__title">Bem-vindo, {{ auth.user?.name ?? 'utilizador' }}.</h1>
      <p class="home__subtitle">O que queres fazer hoje?</p>
    </header>

    <div class="home__grid">
      <button
        v-for="card in cards"
        :key="card.name"
        type="button"
        class="home__card k-fade-up"
        @click="router.push({ name: card.name })"
      >
        <component :is="card.icon" :size="28" :stroke-width="1.5" class="home__icon" />
        <h2 class="home__card-title">{{ card.title }}</h2>
        <p class="home__card-desc">{{ card.description }}</p>
      </button>
    </div>
  </div>
</template>

<style scoped>
.home__head {
  margin-bottom: 1.5rem;
}
.home__title {
  margin: 0 0 0.25rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--k-navy);
}
.home__subtitle {
  margin: 0;
  color: var(--k-gray-500);
}
.home__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
}
.home__card {
  text-align: left;
  background: #fff;
  border: 1px solid var(--k-gray-200);
  border-radius: var(--k-radius-2xl);
  padding: 1.25rem;
  cursor: pointer;
  transition: box-shadow 0.2s ease, transform 0.1s ease;
  font-family: var(--k-font);
}
.home__card:hover {
  box-shadow: var(--k-shadow-soft);
}
.home__icon {
  color: var(--k-green);
}
.home__card-title {
  margin: 0.75rem 0 0.25rem;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--k-navy);
}
.home__card-desc {
  margin: 0;
  font-size: 0.85rem;
  color: var(--k-gray-500);
}
</style>
