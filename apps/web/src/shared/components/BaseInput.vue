<script setup lang="ts">
import { Eye, EyeOff } from 'lucide-vue-next';
import { type Component, computed, ref, useId } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    type?: string;
    label?: string;
    placeholder?: string;
    required?: boolean;
    autocomplete?: string;
    /** Cor do anel de foco. */
    accent?: 'navy' | 'green';
    /** Estilo do label: 'muted' (pequeno cinza) ou 'strong' (navy a bold). */
    labelVariant?: 'muted' | 'strong';
    /** Ícone lucide opcional à esquerda. */
    icon?: Component;
  }>(),
  { type: 'text', accent: 'navy', labelVariant: 'strong', required: false },
);

const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

const id = useId();
const showPassword = ref(false);
const isPassword = computed(() => props.type === 'password');
const resolvedType = computed(() => (isPassword.value && showPassword.value ? 'text' : props.type));

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value);
}
</script>

<template>
  <div class="k-field">
    <div v-if="label || $slots.labelAction" class="k-field__label-row">
      <label :for="id" :class="['k-field__label', `k-field__label--${labelVariant}`]">{{ label }}</label>
      <slot name="labelAction" />
    </div>

    <div class="k-field__control">
      <component :is="icon" v-if="icon" :size="17" :stroke-width="1.5" class="k-field__icon" />
      <input
        :id="id"
        :type="resolvedType"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :autocomplete="autocomplete"
        :class="[
          'k-field__input',
          `k-field__input--${accent}`,
          { 'has-icon': icon, 'has-toggle': isPassword },
        ]"
        @input="onInput"
      />
      <button
        v-if="isPassword"
        type="button"
        class="k-field__toggle"
        :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
        @click="showPassword = !showPassword"
      >
        <component :is="showPassword ? EyeOff : Eye" :size="17" :stroke-width="1.5" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.k-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.k-field__label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-inline: 0.25rem;
}
.k-field__label--strong {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--k-navy);
}
.k-field__label--muted {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--k-gray-500);
}
.k-field__control {
  position: relative;
  display: flex;
  align-items: center;
}
.k-field__icon {
  position: absolute;
  left: 0.875rem;
  color: var(--k-gray-400);
  pointer-events: none;
}
.k-field__input {
  width: 100%;
  padding: 0.85rem 1rem;
  background: var(--k-input-bg);
  border: 1px solid var(--k-gray-200);
  border-radius: var(--k-radius-lg);
  color: var(--k-navy);
  font-family: var(--k-font);
  font-size: 0.9rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.k-field__input::placeholder {
  color: var(--k-gray-400);
}
.k-field__input.has-icon {
  padding-left: 2.75rem;
}
.k-field__input.has-toggle {
  padding-right: 2.75rem;
}
.k-field__input:focus {
  outline: none;
  border-color: transparent;
}
.k-field__input--navy:focus {
  box-shadow: 0 0 0 2px var(--k-navy);
}
.k-field__input--green:focus {
  box-shadow: 0 0 0 2px var(--k-green);
}
.k-field__toggle {
  position: absolute;
  right: 0.875rem;
  display: flex;
  align-items: center;
  background: none;
  border: none;
  color: var(--k-gray-400);
  cursor: pointer;
}
.k-field__toggle:hover {
  color: var(--k-gray-600);
}
</style>
