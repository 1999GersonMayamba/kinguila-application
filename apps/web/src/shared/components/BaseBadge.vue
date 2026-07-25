<script setup lang="ts">
withDefaults(defineProps<{ variant?: 'neutral' | 'success' | 'danger' }>(), {
  variant: 'neutral',
});
</script>

<template>
  <span :class="['k-badge', `k-badge--${variant}`]">
    <slot />
  </span>
</template>

<style scoped>
.k-badge {
  display: inline-block;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}
.k-badge--neutral {
  background: var(--k-gray-100);
  color: var(--k-gray-600);
}
.k-badge--success {
  background: rgba(31, 175, 117, 0.15);
  color: var(--k-green);
}
.k-badge--danger {
  background: rgba(212, 24, 61, 0.12);
  color: #d4183d;
}
</style>
