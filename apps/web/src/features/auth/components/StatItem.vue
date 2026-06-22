<script setup lang="ts">
/** Estatística (valor + rótulo) da linha de stats do ecrã Welcome. */
defineProps<{
  value: string;
  label: string;
  /** Cor do valor (token de marca). */
  color: string;
}>();
</script>

<template>
  <div class="stat">
    <p class="stat__value" :style="{ color }">{{ value }}</p>
    <p class="stat__label">{{ label }}</p>
  </div>
</template>

<style scoped>
.stat {
  text-align: center;
}
.stat__value {
  margin: 0 0 0.2rem;
  font-size: 1.125rem;
  font-weight: 700;
}
.stat__label {
  margin: 0;
  font-size: 0.75rem;
  color: var(--k-gray-400);
}
</style>
