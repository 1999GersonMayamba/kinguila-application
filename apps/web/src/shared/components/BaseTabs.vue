<script setup lang="ts">
defineProps<{
  modelValue: string;
  tabs: { key: string; label: string }[];
}>();
defineEmits<{ 'update:modelValue': [key: string] }>();
</script>

<template>
  <div class="k-tabs" role="tablist">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      type="button"
      role="tab"
      :aria-selected="tab.key === modelValue"
      :class="['k-tabs__tab', { 'k-tabs__tab--active': tab.key === modelValue }]"
      @click="$emit('update:modelValue', tab.key)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<style scoped>
.k-tabs {
  display: flex;
  gap: 0.25rem;
  border-bottom: 1px solid var(--k-gray-200);
  overflow-x: auto;
}
.k-tabs__tab {
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--k-gray-500);
  font-family: var(--k-font);
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
}
.k-tabs__tab--active {
  color: var(--k-navy);
  border-bottom-color: var(--k-navy);
  font-weight: 600;
}
</style>
