<script setup lang="ts">
defineProps<{
  columns: { key: string; label: string }[];
  loading?: boolean;
  empty?: boolean;
  emptyText?: string;
}>();
</script>

<template>
  <div class="k-table__wrap">
    <table class="k-table">
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.key" class="k-table__th">{{ col.label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td :colspan="columns.length" class="k-table__state">A carregar…</td>
        </tr>
        <tr v-else-if="empty">
          <td :colspan="columns.length" class="k-table__state">
            {{ emptyText ?? 'Sem registos.' }}
          </td>
        </tr>
        <!-- Linhas tipadas renderizadas pelo consumidor. -->
        <slot v-else />
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.k-table__wrap {
  overflow-x: auto;
}
.k-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}
.k-table__th {
  text-align: left;
  padding: 0.6rem 0.75rem;
  color: var(--k-gray-500);
  font-weight: 600;
  border-bottom: 1px solid var(--k-gray-200);
  white-space: nowrap;
}
.k-table__state {
  padding: 1.5rem;
  text-align: center;
  color: var(--k-gray-400);
}
</style>
