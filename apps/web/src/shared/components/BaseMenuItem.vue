<script setup lang="ts">
/** Item de um BaseMenu: ícone (slot `icon`) + label. Estilo vem do BaseMenu. */
defineProps<{ danger?: boolean; disabled?: boolean }>();
</script>

<template>
  <button
    type="button"
    class="k-menu-item"
    :class="{ 'k-menu-item--danger': danger }"
    :disabled="disabled"
  >
    <slot name="icon" />
    <span><slot /></span>
  </button>
</template>
