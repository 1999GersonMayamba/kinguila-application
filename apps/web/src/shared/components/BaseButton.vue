<script setup lang="ts">
withDefaults(
  defineProps<{
    type?: 'button' | 'submit';
    variant?: 'primary' | 'success' | 'ghost';
    block?: boolean;
    disabled?: boolean;
  }>(),
  { type: 'button', variant: 'primary', block: false, disabled: false },
);
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="['k-btn', `k-btn--${variant}`, { 'k-btn--block': block }]"
  >
    <slot />
  </button>
</template>

<style scoped>
.k-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.85rem 1.25rem;
  border: none;
  border-radius: var(--k-radius-lg);
  font-family: var(--k-font);
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: transform 0.1s ease, opacity 0.2s ease, background 0.2s ease;
}
.k-btn--block {
  width: 100%;
}
.k-btn:active {
  transform: scale(0.98);
}
.k-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.k-btn--primary {
  background: var(--k-navy);
  color: #fff;
}
.k-btn--primary:hover:not(:disabled) {
  background: var(--k-navy-700);
}
.k-btn--success {
  background: var(--k-green);
  color: #fff;
  font-weight: 700;
}
.k-btn--success:hover:not(:disabled) {
  opacity: 0.9;
}
.k-btn--ghost {
  background: transparent;
  color: var(--k-navy);
  font-weight: 500;
}
.k-btn--ghost:hover:not(:disabled) {
  opacity: 0.8;
}
</style>
