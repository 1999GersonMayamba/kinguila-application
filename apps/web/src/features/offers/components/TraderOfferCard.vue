<script setup lang="ts">
import { ArrowRight, ChevronRight, Shield, Star } from 'lucide-vue-next';
import { computed } from 'vue';
import { FLAG_EMOJI, type MarketplaceOffer } from '../data/marketplace.mock';

const props = defineProps<{ offer: MarketplaceOffer }>();
defineEmits<(e: 'select', id: string) => void>();

const fmt = (n: number) => n.toLocaleString('pt-BR');
const flagFrom = computed(() => FLAG_EMOJI[props.offer.currency] ?? '🌐');
const flagTo = computed(() => FLAG_EMOJI[props.offer.targetCurrency] ?? '🌐');
</script>

<template>
  <button type="button" class="card" @click="$emit('select', offer.id)">
    <!-- Trader -->
    <div class="card__trader">
      <div class="card__avatar-wrap">
        <div class="card__avatar">{{ offer.trader.avatar }}</div>
        <span v-if="offer.trader.online" class="card__online" />
      </div>

      <div class="card__trader-info">
        <div class="card__name-row">
          <span class="card__name">{{ offer.trader.name }}</span>
          <Shield v-if="offer.trader.verified" :size="13" class="card__verified" />
        </div>
        <div class="card__meta">
          <span class="card__rating">
            <Star :size="10" class="card__star" />
            {{ offer.trader.rating }}
          </span>
          <span class="card__dot">·</span>
          <span>{{ offer.trader.trades }} operações</span>
          <span class="card__dot">·</span>
          <span class="card__completion">{{ offer.trader.completionRate }}%</span>
        </div>
      </div>

      <ChevronRight :size="16" class="card__chevron" />
    </div>

    <!-- Taxa e montantes -->
    <div class="card__rate">
      <div class="card__rate-top">
        <div class="card__pair">
          <span class="card__flag">{{ flagFrom }}</span>
          <span class="card__cur">{{ offer.currency }}</span>
          <ArrowRight :size="12" class="card__arrow" />
          <span class="card__flag">{{ flagTo }}</span>
          <span class="card__cur">{{ offer.targetCurrency }}</span>
        </div>
        <div class="card__rate-value">
          <p class="card__rate-label">Taxa</p>
          <p class="card__rate-num">{{ offer.rate.toFixed(4) }}</p>
        </div>
      </div>
      <div class="card__amounts">
        <span>Mín: <strong>{{ fmt(offer.minAmount) }} {{ offer.currency }}</strong></span>
        <span>Disponível: <strong>{{ fmt(offer.available) }} {{ offer.currency }}</strong></span>
      </div>
    </div>

    <!-- Pagamentos + CTA -->
    <div class="card__foot">
      <div class="card__methods">
        <span v-for="m in offer.paymentMethods" :key="m" class="card__method">{{ m }}</span>
      </div>
      <span class="card__cta">Ver detalhes →</span>
    </div>
  </button>
</template>

<style scoped>
.card {
  width: 100%;
  text-align: left;
  background: var(--k-surface);
  border: none;
  border-radius: var(--k-radius-2xl);
  padding: 1rem;
  cursor: pointer;
  font-family: var(--k-font);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  transition: transform 0.1s ease, box-shadow 0.2s ease;
}
.card:hover {
  box-shadow: var(--k-shadow-soft);
}
.card:active {
  transform: scale(0.98);
}

/* Trader */
.card__trader {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}
.card__avatar-wrap {
  position: relative;
  flex-shrink: 0;
}
.card__avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--k-green-dark);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
}
.card__online {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 50%;
  background: var(--k-green);
  border: 2px solid var(--k-surface);
}
.card__trader-info {
  flex: 1;
  min-width: 0;
}
.card__name-row {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-bottom: 0.125rem;
}
.card__name {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--k-green-dark);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card__verified {
  color: var(--k-green);
  fill: var(--k-green);
  flex-shrink: 0;
}
.card__meta {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.6875rem;
  color: var(--k-gray-400);
}
.card__rating {
  display: inline-flex;
  align-items: center;
  gap: 0.125rem;
  font-weight: 500;
}
.card__star {
  color: var(--k-yellow);
  fill: var(--k-yellow);
}
.card__completion {
  color: var(--k-green);
  font-weight: 600;
}
.card__chevron {
  color: var(--k-gray-400);
  flex-shrink: 0;
}

/* Caixa de taxa */
.card__rate {
  background: var(--k-page-mobile);
  border-radius: var(--k-radius-xl);
  padding: 0.75rem;
  margin-bottom: 0.75rem;
}
.card__rate-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}
.card__pair {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}
.card__flag {
  font-size: 1rem;
}
.card__cur {
  font-size: 0.75rem;
  color: var(--k-gray-400);
}
.card__arrow {
  color: var(--k-gray-400);
}
.card__rate-value {
  text-align: right;
}
.card__rate-label {
  margin: 0;
  font-size: 0.625rem;
  color: var(--k-gray-400);
}
.card__rate-num {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--k-green-dark);
}
.card__amounts {
  display: flex;
  gap: 1rem;
  font-size: 0.6875rem;
  color: var(--k-gray-400);
}
.card__amounts strong {
  color: var(--k-green-dark);
  font-weight: 600;
}

/* Pagamentos */
.card__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
.card__methods {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}
.card__method {
  font-size: 0.625rem;
  font-weight: 600;
  padding: 0.125rem 0.5rem;
  border-radius: var(--k-radius-lg);
  background: #e6f7f0;
  color: var(--k-green);
}
.card__cta {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--k-green);
  white-space: nowrap;
}
</style>
