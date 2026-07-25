<script setup lang="ts">
const props = defineProps<{ modelValue: boolean; disabled?: boolean; label?: string }>();
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();

function toggle() {
  if (!props.disabled) {
    emit('update:modelValue', !props.modelValue);
  }
}
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :aria-label="label"
    :disabled="disabled"
    :class="['k-toggle', { 'k-toggle--on': modelValue }]"
    @click="toggle"
  >
    <span class="k-toggle__knob" />
  </button>
</template>

<style scoped>
.k-toggle {
  width: 2.5rem;
  height: 1.4rem;
  border-radius: 999px;
  border: none;
  background: var(--k-gray-300);
  position: relative;
  cursor: pointer;
  transition: background 0.2s ease;
  padding: 0;
}
.k-toggle--on {
  background: var(--k-green);
}
.k-toggle:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.k-toggle__knob {
  position: absolute;
  top: 0.15rem;
  left: 0.15rem;
  width: 1.1rem;
  height: 1.1rem;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.2s ease;
}
.k-toggle--on .k-toggle__knob {
  transform: translateX(1.1rem);
}
</style>
