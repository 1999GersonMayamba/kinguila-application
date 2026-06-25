<script setup lang="ts">
import AppShell from '@/layouts/AppShell.vue';
import AuthLayout from '@/layouts/AuthLayout.vue';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

// Seleciona o layout via meta.layout. Mapa explícito (3 valores): um valor
// desconhecido cai no DefaultLayout, mas `app`/`auth` resolvem corretamente.
const layouts = { auth: AuthLayout, app: AppShell } as const;
const layout = computed(() => {
  const key = route.meta.layout as keyof typeof layouts | undefined;
  return (key && layouts[key]) || DefaultLayout;
});
</script>

<template>
  <component :is="layout" />
</template>
