<script setup lang="ts">
import { onMounted } from 'vue';
import OfferCard from '../components/OfferCard.vue';
import { useOffers } from '../composables/useOffers';

const { offers, loading, error, load } = useOffers();

onMounted(() => load());
</script>

<template>
  <section class="offers">
    <header class="offers__header">
      <h1>Ofertas disponíveis</h1>
    </header>

    <p v-if="loading">A carregar ofertas…</p>
    <p v-else-if="error" class="offers__error">{{ error }}</p>
    <p v-else-if="offers.length === 0">Ainda não há ofertas ativas.</p>

    <div v-else class="offers__grid">
      <OfferCard v-for="offer in offers" :key="offer.id" :offer="offer" />
    </div>
  </section>
</template>

<style scoped>
.offers {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.offers__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
}
.offers__error {
  color: #c0392b;
}
</style>
