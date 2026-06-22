<script setup lang="ts">
import AuthLayout from '@/layouts/AuthLayout.vue';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
// Seleciona o layout via meta.layout (default | auth).
const layout = computed(() => (route.meta.layout === 'auth' ? AuthLayout : DefaultLayout));
</script>

<template>
  <component :is="layout" />
</template>
