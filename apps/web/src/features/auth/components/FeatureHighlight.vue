<script setup lang="ts">
import type { Component } from 'vue';

/** Linha de destaque (ícone + título + descrição) usada no ecrã Welcome. */
defineProps<{
  icon: Component;
  title: string;
  description: string;
  /** Cor de fundo do ícone (token de marca). */
  color: string;
}>();
</script>

<template>
  <div class="feature">
    <div class="feature__icon" :style="{ backgroundColor: color }">
      <component :is="icon" :size="20" :stroke-width="2" color="#fff" />
    </div>
    <div class="feature__body">
      <p class="feature__title">{{ title }}</p>
      <p class="feature__desc">{{ description }}</p>
    </div>
  </div>
</template>

<style scoped>
.feature {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: var(--k-radius-xl);
}
.feature__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--k-radius-xl);
  flex-shrink: 0;
}
.feature__body {
  padding-top: 0.15rem;
}
.feature__title {
  margin: 0 0 0.2rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--k-navy);
}
.feature__desc {
  margin: 0;
  font-size: 0.75rem;
  color: var(--k-gray-500);
}
</style>
