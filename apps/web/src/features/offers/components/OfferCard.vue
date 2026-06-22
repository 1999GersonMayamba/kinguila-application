<script setup lang="ts">
import { formatCurrency } from '@/shared/utils/formatCurrency';
import type { OfferResponse } from '@kinguila/contracts';
import { computed } from 'vue';

const props = defineProps<{ offer: OfferResponse }>();

const available = computed(() =>
  formatCurrency(props.offer.availableAmount, props.offer.sellCurrency),
);
</script>

<template>
  <article class="offer-card">
    <header>
      <strong>{{ offer.sellCurrency }} → {{ offer.buyCurrency }}</strong>
      <span class="offer-card__status">{{ offer.status }}</span>
    </header>
    <p class="offer-card__rate">
      Taxa: 1 {{ offer.sellCurrency }} = {{ offer.exchangeRate }} {{ offer.buyCurrency }}
    </p>
    <p>Disponível: {{ available }}</p>
  </article>
</template>

<style scoped>
.offer-card {
  border: 1px solid #e1e4e8;
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.offer-card header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.offer-card__status {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #2da44e;
}
.offer-card__rate {
  color: #57606a;
  font-size: 0.9rem;
}
</style>
