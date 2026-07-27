<script setup lang="ts">
import { Plus, Search } from 'lucide-vue-next';
import { computed, ref } from 'vue';
import TraderOfferCard from '../components/TraderOfferCard.vue';
import {
  CURRENCY_FILTERS,
  FLAG_EMOJI,
  MARKETPLACE_METRICS,
  MOCK_OFFERS,
} from '../data/marketplace.mock';

// UI estática por agora (dados do Figma). A ligação à API vem depois.
type Tab = 'buy' | 'sell';
const tab = ref<Tab>('buy');
const currency = ref<string>('Todos');
const search = ref('');

const filtered = computed(() =>
  MOCK_OFFERS.filter((o) => {
    // A tab "Comprar" mostra quem vende; "Vender" mostra quem compra.
    const matchTab = tab.value === 'buy' ? o.type === 'sell' : o.type === 'buy';
    const matchCurrency =
      currency.value === 'Todos' ||
      o.currency === currency.value ||
      o.targetCurrency === currency.value;
    const matchSearch =
      !search.value || o.trader.name.toLowerCase().includes(search.value.toLowerCase());
    return matchTab && matchCurrency && matchSearch;
  }),
);
</script>

<template>
  <section class="market">
    <!-- Header -->
    <header class="market__head">
      <div>
        <h1 class="market__title">Marketplace P2P</h1>
        <p class="market__subtitle">Câmbio peer-to-peer</p>
      </div>
      <button type="button" class="market__announce">
        <Plus :size="14" :stroke-width="2.5" />
        Anunciar
      </button>
    </header>

    <!-- Métricas -->
    <div class="market__metrics">
      <div v-for="m in MARKETPLACE_METRICS" :key="m.label" class="market__metric">
        <p class="market__metric-value">{{ m.value }}</p>
        <p class="market__metric-label">{{ m.label }}</p>
      </div>
    </div>

    <!-- Filtros -->
    <div class="market__filters">
      <div class="market__tabs">
        <button
          type="button"
          class="market__tab"
          :class="{ 'market__tab--active': tab === 'buy' }"
          @click="tab = 'buy'"
        >
          Comprar
        </button>
        <button
          type="button"
          class="market__tab"
          :class="{ 'market__tab--active': tab === 'sell' }"
          @click="tab = 'sell'"
        >
          Vender
        </button>
      </div>

      <div class="market__search">
        <Search :size="15" :stroke-width="2" class="market__search-icon" />
        <input v-model="search" type="text" placeholder="Pesquisar trader..." />
      </div>

      <div class="market__pills">
        <button
          v-for="c in CURRENCY_FILTERS"
          :key="c"
          type="button"
          class="market__pill"
          :class="{ 'market__pill--active': currency === c }"
          @click="currency = c"
        >
          <span v-if="c !== 'Todos'" class="market__pill-flag">{{ FLAG_EMOJI[c] }}</span>
          {{ c }}
        </button>
      </div>
    </div>

    <!-- Lista -->
    <div v-if="filtered.length === 0" class="market__empty">
      <div class="market__empty-icon"><Search :size="24" /></div>
      <p>Nenhuma oferta encontrada</p>
    </div>
    <div v-else class="market__grid">
      <TraderOfferCard v-for="offer in filtered" :key="offer.id" :offer="offer" />
    </div>
  </section>
</template>

<style scoped>
.market {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  font-family: var(--k-font);
}

/* Header */
.market__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.market__title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--k-green-dark);
}
.market__subtitle {
  margin: 0.125rem 0 0;
  font-size: 0.75rem;
  color: var(--k-gray-400);
}
.market__announce {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.55rem 0.9rem;
  border: none;
  border-radius: var(--k-radius-xl);
  background: var(--k-green);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  font-family: var(--k-font);
  cursor: pointer;
  transition: transform 0.1s ease, filter 0.15s ease;
  flex-shrink: 0;
}
.market__announce:hover {
  filter: brightness(0.96);
}
.market__announce:active {
  transform: scale(0.96);
}

/* Métricas */
.market__metrics {
  display: flex;
  gap: 1.5rem;
}
.market__metric-value {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--k-green-dark);
}
.market__metric-label {
  margin: 0;
  font-size: 0.625rem;
  color: var(--k-gray-400);
}

/* Filtros */
.market__filters {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.market__tabs {
  display: flex;
  gap: 0.25rem;
}
.market__tab {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: var(--k-radius-xl);
  background: transparent;
  color: var(--k-gray-400);
  font-size: 0.875rem;
  font-weight: 400;
  font-family: var(--k-font);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}
.market__tab--active {
  background: var(--k-green-dark);
  color: #fff;
  font-weight: 600;
}
.market__search {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--k-page-mobile);
  border: 1px solid var(--k-border);
  border-radius: var(--k-radius-xl);
  padding: 0.55rem 0.75rem;
}
.market__search-icon {
  color: var(--k-gray-400);
  flex-shrink: 0;
}
.market__search input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 0.875rem;
  color: var(--k-green-dark);
  font-family: var(--k-font);
}
.market__search input::placeholder {
  color: var(--k-gray-400);
}
.market__pills {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.125rem;
}
.market__pill {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.35rem 0.75rem;
  border: 1px solid var(--k-border);
  border-radius: 999px;
  background: var(--k-surface);
  color: var(--k-gray-500);
  font-size: 0.75rem;
  font-family: var(--k-font);
  cursor: pointer;
  transition: all 0.15s ease;
}
.market__pill--active {
  border-color: var(--k-green);
  background: #e6f7f0;
  color: var(--k-green);
  font-weight: 600;
}

/* Lista */
.market__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}
.market__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 4rem 0;
  color: var(--k-gray-400);
  font-size: 0.875rem;
}
.market__empty-icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background: var(--k-page-mobile);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* PC: cartões em 2 colunas para melhor densidade no shell largo. */
@media (min-width: 768px) {
  .market__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
