<script setup lang="ts">
import BaseButton from '@/shared/components/BaseButton.vue';
import KLogo from '@/shared/components/KLogo.vue';
import { Shield, TrendingUp, Users } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import FeatureHighlight from '../components/FeatureHighlight.vue';
import StatItem from '../components/StatItem.vue';

const router = useRouter();

// Conteúdo estático nesta fase (será dinâmico após a integração).
const features = [
  {
    icon: TrendingUp,
    color: 'var(--k-green)',
    title: 'Melhores taxas',
    description: 'Você define o preço no marketplace P2P',
  },
  {
    icon: Shield,
    color: 'var(--k-navy)',
    title: '100% seguro',
    description: 'Proteção via escrow e KYC verificado',
  },
  {
    icon: Users,
    color: 'var(--k-yellow)',
    title: 'Comunidade confiável',
    description: 'Sistema de reputação e avaliações',
  },
];

const stats = [
  { value: '5k+', label: 'Usuários', color: 'var(--k-navy)' },
  { value: '98%', label: 'Satisfação', color: 'var(--k-green)' },
  { value: '24/7', label: 'Suporte', color: 'var(--k-yellow)' },
];
</script>

<template>
  <div class="welcome">
    <div class="welcome__content">
      <header class="welcome__intro k-fade-up">
        <h1 class="welcome__title">Kinguila</h1>
        <p class="welcome__subtitle">
          Câmbio peer-to-peer entre Angola e Brasil com segurança e transparência.
        </p>
      </header>

      <div class="welcome__card k-fade-up">
        <div class="welcome__logo">
          <KLogo :size="64" gradient />
        </div>

        <div class="welcome__features">
          <FeatureHighlight
            v-for="feature in features"
            :key="feature.title"
            :icon="feature.icon"
            :title="feature.title"
            :description="feature.description"
            :color="feature.color"
          />
        </div>

        <div class="welcome__stats">
          <StatItem
            v-for="stat in stats"
            :key="stat.label"
            :value="stat.value"
            :label="stat.label"
            :color="stat.color"
          />
        </div>

        <div class="welcome__actions">
          <BaseButton variant="primary" block @click="router.push({ name: 'register' })">
            Criar conta
          </BaseButton>
          <BaseButton variant="ghost" block @click="router.push({ name: 'login' })">
            Já tenho conta
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.welcome {
  min-height: 100vh;
  background: var(--k-gradient-welcome);
  display: flex;
  justify-content: center;
}
.welcome__content {
  width: 100%;
  max-width: 24rem;
  padding: 4rem 1.5rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.welcome__intro {
  text-align: center;
}
.welcome__title {
  margin: 0 0 0.75rem;
  font-size: 2rem;
  font-weight: 700;
  color: var(--k-ink);
}
.welcome__subtitle {
  margin: 0 auto;
  max-width: 18rem;
  font-size: 0.9375rem;
  color: var(--k-gray-600);
}
.welcome__card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-radius: var(--k-radius-3xl);
  padding: 1.5rem 1.5rem 2rem;
  box-shadow: var(--k-shadow-card);
}
.welcome__logo {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}
.welcome__features {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.welcome__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--k-gray-100);
}
.welcome__actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1.5rem;
}
</style>
