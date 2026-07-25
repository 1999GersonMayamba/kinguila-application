<script setup lang="ts">
import { computed } from 'vue';

/**
 * Logótipo Kinguila (do Figma): "K" geométrico — barra + dois braços verdes e ponto
 * dourado — com wordmark e subtítulo opcionais. Na variante `light` (fundos escuros,
 * ex.: sidebar) as partes verde-escuras do "K" e o texto passam a claros.
 */
const props = withDefaults(
  defineProps<{
    size?: number;
    withWordmark?: boolean;
    subtitle?: boolean;
    light?: boolean;
    /** Mantida por compatibilidade; sem efeito no logótipo geométrico. */
    gradient?: boolean;
  }>(),
  { size: 48, withWordmark: false, subtitle: false, light: false, gradient: false },
);

const darkFill = computed(() => (props.light ? '#ffffff' : '#122b1b'));
const wordmarkColor = computed(() => (props.light ? '#ffffff' : 'var(--k-green-dark)'));
const subtitleColor = computed(() =>
  props.light ? 'rgba(255, 255, 255, 0.55)' : 'var(--k-gray-400)',
);
</script>

<template>
  <div class="k-logo">
    <svg
      class="k-logo__icon"
      :width="size"
      :height="size"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="5" y="5" width="11" height="38" rx="2" :fill="darkFill" />
      <polygon points="16,5 44,5 44,17 16,22" fill="#1faf75" />
      <polygon points="16,26 44,31 44,43 16,43" :fill="darkFill" />
      <circle cx="38" cy="24" r="5.5" fill="#f5b800" />
    </svg>

    <div v-if="withWordmark" class="k-logo__text">
      <span
        class="k-logo__wordmark"
        :style="{ color: wordmarkColor, fontSize: `${Math.round(size * 0.5)}px` }"
      >
        Kinguila
      </span>
      <span
        v-if="subtitle"
        class="k-logo__subtitle"
        :style="{ color: subtitleColor, fontSize: `${Math.max(9, Math.round(size * 0.28))}px` }"
      >
        Marketplace de Câmbio
      </span>
    </div>
  </div>
</template>

<style scoped>
.k-logo {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
}
.k-logo__icon {
  flex-shrink: 0;
}
.k-logo__text {
  display: flex;
  flex-direction: column;
  line-height: 1.05;
}
.k-logo__wordmark {
  font-weight: 700;
  letter-spacing: 0.03em;
}
.k-logo__subtitle {
  font-weight: 400;
  letter-spacing: 0.01em;
  margin-top: 1px;
}
</style>
