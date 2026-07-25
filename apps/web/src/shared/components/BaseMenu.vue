<script setup lang="ts">
import { MoreVertical } from 'lucide-vue-next';
import { onBeforeUnmount, onMounted, ref } from 'vue';

/**
 * Menu de ações (kebab): botão de três pontos que abre um painel com as ações.
 * O painel usa `position: fixed` (posicionado a partir do botão) para não ser cortado
 * pelo `overflow` das tabelas.
 */
const open = ref(false);
const root = ref<HTMLElement | null>(null);
const panelStyle = ref<Record<string, string>>({});

function openAt(trigger: HTMLElement) {
  const rect = trigger.getBoundingClientRect();
  panelStyle.value = {
    top: `${rect.bottom + 4}px`,
    right: `${window.innerWidth - rect.right}px`,
  };
  open.value = true;
}

function toggle(event: MouseEvent) {
  if (open.value) {
    close();
    return;
  }
  openAt(event.currentTarget as HTMLElement);
}
function close() {
  open.value = false;
}
function onDocClick(event: MouseEvent) {
  if (root.value && !root.value.contains(event.target as Node)) close();
}
function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') close();
}

onMounted(() => {
  document.addEventListener('click', onDocClick);
  document.addEventListener('keydown', onKey);
  // Posição é fixa: ao rolar/redimensionar, fecha para não ficar desalinhado.
  window.addEventListener('scroll', close, true);
  window.addEventListener('resize', close);
});
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick);
  document.removeEventListener('keydown', onKey);
  window.removeEventListener('scroll', close, true);
  window.removeEventListener('resize', close);
});
</script>

<template>
  <div ref="root" class="k-menu">
    <button type="button" class="k-menu__trigger" aria-label="Ações" @click.stop="toggle">
      <MoreVertical :size="18" />
    </button>
    <!-- Fecha ao escolher uma ação (clique borbulha do item). -->
    <div v-if="open" class="k-menu__panel" role="menu" :style="panelStyle" @click="close">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.k-menu {
  position: relative;
  display: inline-flex;
}
.k-menu__trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: var(--k-radius-lg);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--k-gray-500);
}
.k-menu__trigger:hover {
  background: var(--k-gray-100);
  color: var(--k-green-dark);
}
.k-menu__panel {
  position: fixed;
  z-index: 40;
  min-width: 11rem;
  padding: 0.35rem;
  background: var(--k-surface);
  border: 1px solid var(--k-border);
  border-radius: var(--k-radius-xl);
  box-shadow: var(--k-shadow-card);
  display: flex;
  flex-direction: column;
}

/* Estiliza os BaseMenuItem colocados no slot (uma só fonte de estilo). */
:deep(.k-menu-item) {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.55rem 0.7rem;
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--k-font);
  font-size: 0.85rem;
  color: var(--k-gray-700);
  text-align: left;
  border-radius: var(--k-radius-lg);
}
:deep(.k-menu-item:hover:not(:disabled)) {
  background: var(--k-gray-100);
}
:deep(.k-menu-item--danger) {
  color: #d4183d;
}
:deep(.k-menu-item:disabled) {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
