<script setup lang="ts">
/** Logótipo Kinguila: badge "K" (opcionalmente com gradiente) e wordmark opcional. */
withDefaults(
  defineProps<{
    size?: number;
    withWordmark?: boolean;
    gradient?: boolean;
  }>(),
  { size: 48, withWordmark: false, gradient: false },
);
</script>

<template>
  <div class="k-logo">
    <div
      class="k-logo__badge"
      :class="{ 'k-logo__badge--gradient': gradient }"
      :style="{
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${Math.round(size * 0.42)}px`,
        borderRadius: `${Math.round(size * 0.28)}px`,
      }"
    >
      K
    </div>
    <span v-if="withWordmark" class="k-logo__wordmark" :style="{ fontSize: `${Math.round(size * 0.5)}px` }">
      Kinguila
    </span>
  </div>
</template>

<style scoped>
.k-logo {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
}
.k-logo__badge {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--k-navy);
  color: #fff;
  font-weight: 700;
  box-shadow: 0 8px 20px rgba(30, 42, 90, 0.25);
}
.k-logo__badge--gradient {
  background: linear-gradient(135deg, var(--k-navy) 0%, var(--k-navy-700) 100%);
}
.k-logo__wordmark {
  color: var(--k-navy);
  font-weight: 700;
}
</style>
