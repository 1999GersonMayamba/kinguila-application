<script setup lang="ts">
defineProps<{
  type?: 'button' | 'submit';
  variant?: 'primary' | 'ghost';
  disabled?: boolean;
}>();
</script>

<template>
  <button
    :type="type ?? 'button'"
    :disabled="disabled"
    :class="['base-button', `base-button--${variant ?? 'primary'}`]"
  >
    <slot />
  </button>
</template>

<style scoped>
.base-button {
  padding: 0.6rem 1.1rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
}
.base-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.base-button--primary {
  background: #1f6feb;
  color: #fff;
}
.base-button--ghost {
  background: transparent;
  color: #1f6feb;
}
</style>
