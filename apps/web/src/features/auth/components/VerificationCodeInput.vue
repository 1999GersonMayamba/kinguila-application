<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ modelValue: string }>();
const emit = defineEmits<{ 'update:modelValue': [value: string]; complete: [value: string] }>();

const value = computed(() => props.modelValue);

function onInput(event: Event) {
  // Mantém apenas dígitos e limita a 6.
  const digits = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 6);
  emit('update:modelValue', digits);
  if (digits.length === 6) {
    emit('complete', digits);
  }
}
</script>

<template>
  <input
    :value="value"
    type="text"
    inputmode="numeric"
    autocomplete="one-time-code"
    maxlength="6"
    aria-label="Código de verificação de 6 dígitos"
    placeholder="••••••"
    class="k-code-input"
    @input="onInput"
  />
</template>

<style scoped>
.k-code-input {
  width: 100%;
  padding: 0.85rem 1rem;
  background: var(--k-input-bg);
  border: 1px solid var(--k-gray-200);
  border-radius: var(--k-radius-lg);
  color: var(--k-navy);
  font-family: var(--k-font);
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 0.5rem;
  text-align: center;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.k-code-input::placeholder {
  color: var(--k-gray-300, #cbd2dd);
  letter-spacing: 0.5rem;
}
.k-code-input:focus {
  outline: none;
  border-color: transparent;
  box-shadow: 0 0 0 2px var(--k-green);
}
</style>
