<script setup lang="ts">
import { ApiError } from '@/shared/api/httpClient';
import BaseButton from '@/shared/components/BaseButton.vue';
import BaseInput from '@/shared/components/BaseInput.vue';
import KLogo from '@/shared/components/KLogo.vue';
import { Mail } from 'lucide-vue-next';
import { onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import VerificationCodeInput from '../components/VerificationCodeInput.vue';
import { useAuthForm } from '../composables/useAuthForm';

const route = useRoute();
const router = useRouter();
const { loading, error, submit, auth } = useAuthForm();

// O email chega por router state (preferido) com fallback à query string.
const stateEmail = (window.history.state?.email as string | undefined) ?? '';
const queryEmail = typeof route.query.email === 'string' ? route.query.email : '';
const email = ref(stateEmail || queryEmail);
const code = ref('');

// Estado do reenvio (com cooldown para evitar spam; o backend também limita).
const resendLoading = ref(false);
const resendMessage = ref<string | null>(null);
const cooldown = ref(0);
let cooldownTimer: ReturnType<typeof setInterval> | null = null;

function startCooldown(seconds: number) {
  cooldown.value = seconds;
  cooldownTimer = setInterval(() => {
    cooldown.value -= 1;
    if (cooldown.value <= 0 && cooldownTimer) {
      clearInterval(cooldownTimer);
      cooldownTimer = null;
    }
  }, 1000);
}

onUnmounted(() => {
  if (cooldownTimer) clearInterval(cooldownTimer);
});

function onSubmit() {
  if (code.value.length !== 6 || !email.value) return;
  // confirmEmail autentica (guarda tokens) → redireciona para offers (default).
  submit(() => auth.confirmEmail({ email: email.value, code: code.value }));
}

async function onResend() {
  if (!email.value || cooldown.value > 0 || resendLoading.value) return;
  resendLoading.value = true;
  resendMessage.value = null;
  try {
    await auth.resendCode({ email: email.value });
    resendMessage.value = 'Se a conta existir, enviámos um novo código.';
    startCooldown(60);
  } catch (err) {
    resendMessage.value = err instanceof ApiError ? err.message : 'Não foi possível reenviar.';
  } finally {
    resendLoading.value = false;
  }
}
</script>

<template>
  <div class="verify">
    <div class="verify__content k-fade-up">
      <header class="verify__head">
        <KLogo :size="48" with-wordmark class="verify__logo" />
        <h1 class="verify__title">Confirme a sua conta</h1>
        <p class="verify__subtitle">
          Introduza o código de 6 dígitos
          <template v-if="email"> enviado para <strong>{{ email }}</strong></template>.
        </p>
      </header>

      <form class="verify__form" @submit.prevent="onSubmit">
        <BaseInput
          v-if="!email"
          v-model="email"
          type="email"
          label="Email"
          placeholder="seu@email.com"
          accent="green"
          autocomplete="email"
          :icon="Mail"
          required
        />

        <VerificationCodeInput v-model="code" @complete="onSubmit" />

        <p v-if="error" class="verify__error">{{ error }}</p>
        <p v-if="resendMessage" class="verify__hint">{{ resendMessage }}</p>

        <BaseButton
          type="submit"
          variant="success"
          block
          :disabled="loading || code.length !== 6 || !email"
        >
          {{ loading ? 'A confirmar…' : 'Confirmar conta' }}
        </BaseButton>

        <button
          type="button"
          class="verify__resend"
          :disabled="resendLoading || cooldown > 0 || !email"
          @click="onResend"
        >
          <template v-if="cooldown > 0">Reenviar código em {{ cooldown }}s</template>
          <template v-else-if="resendLoading">A reenviar…</template>
          <template v-else>Não recebeu? Reenviar código</template>
        </button>
      </form>

      <button class="verify__back" type="button" @click="router.push({ name: 'login' })">
        ← Voltar ao login
      </button>
    </div>
  </div>
</template>

<style scoped>
.verify {
  min-height: 100vh;
  background: var(--k-gradient-login);
  display: flex;
  justify-content: center;
}
.verify__content {
  width: 100%;
  max-width: 28rem;
  padding: 3rem 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.verify__head {
  text-align: center;
  margin-bottom: 2rem;
}
.verify__logo {
  margin-bottom: 1.5rem;
}
.verify__title {
  margin: 0 0 0.5rem;
  font-size: 1.625rem;
  font-weight: 600;
  color: var(--k-ink, #1a2238);
}
.verify__subtitle {
  margin: 0;
  font-size: 0.875rem;
  color: var(--k-gray-500);
}
.verify__form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.verify__error {
  margin: 0;
  font-size: 0.85rem;
  color: #d4183d;
}
.verify__hint {
  margin: 0;
  font-size: 0.85rem;
  color: var(--k-gray-500);
}
.verify__resend {
  background: none;
  border: none;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--k-navy);
  cursor: pointer;
}
.verify__resend:disabled {
  color: var(--k-gray-400);
  cursor: not-allowed;
}
.verify__back {
  margin: 1.5rem auto 0;
  background: none;
  border: none;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--k-navy);
  cursor: pointer;
}
</style>
