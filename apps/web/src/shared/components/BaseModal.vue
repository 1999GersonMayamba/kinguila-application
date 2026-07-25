<script setup lang="ts">
defineProps<{ open: boolean; title?: string }>();
const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="k-modal" @click.self="emit('close')">
      <div class="k-modal__panel" role="dialog" aria-modal="true">
        <header class="k-modal__head">
          <h2 class="k-modal__title">{{ title }}</h2>
          <button type="button" class="k-modal__close" aria-label="Fechar" @click="emit('close')">
            ✕
          </button>
        </header>
        <div class="k-modal__body">
          <slot />
        </div>
        <footer v-if="$slots.footer" class="k-modal__footer">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.k-modal {
  position: fixed;
  inset: 0;
  background: rgba(30, 42, 90, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 50;
}
.k-modal__panel {
  width: 100%;
  max-width: 28rem;
  background: #fff;
  border-radius: var(--k-radius-2xl);
  box-shadow: var(--k-shadow-card);
  display: flex;
  flex-direction: column;
}
.k-modal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--k-gray-100);
}
.k-modal__title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--k-navy);
}
.k-modal__close {
  background: none;
  border: none;
  font-size: 1rem;
  color: var(--k-gray-400);
  cursor: pointer;
}
.k-modal__body {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.k-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--k-gray-100);
}
</style>
