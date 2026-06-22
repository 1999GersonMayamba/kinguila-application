<script setup lang="ts">
import { ApiError } from '@/shared/api/httpClient';
import BaseButton from '@/shared/components/BaseButton.vue';
import BaseInput from '@/shared/components/BaseInput.vue';
import KLogo from '@/shared/components/KLogo.vue';
import { Lock, Mail } from 'lucide-vue-next';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';

type Status = 'request' | 'requested' | 'validating' | 'valid' | 'invalid' | 'done';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

// O token chega no fragmento do URL (#token=...), que não vai para logs/Referer;
// com fallback à query string por robustez.
function readToken(): string {
  const fromHash = new URLSearchParams(route.hash.replace(/^#/, '')).get('token');
  if (fromHash) return fromHash;
  return typeof route.query.token === 'string' ? route.query.token : '';
}

const token = ref('');
const status = ref<Status>('request');
const loading = ref(false);
const error = ref<string | null>(null);
const email = ref('');
const password = ref('');

onMounted(async () => {
  token.value = readToken();
  if (!token.value) {
    status.value = 'request';
    return;
  }
  status.value = 'validating';
  try {
    await auth.validateResetToken({ token: token.value });
    status.value = 'valid';
  } catch {
    status.value = 'invalid';
  }
});

async function onRequest() {
  if (!email.value) return;
  loading.value = true;
  error.value = null;
  try {
    await auth.requestPasswordReset({ email: email.value });
    status.value = 'requested';
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Ocorreu um erro inesperado.';
  } finally {
    loading.value = false;
  }
}

async function onReset() {
  if (password.value.length < 8) {
    error.value = 'A senha deve ter pelo menos 8 caracteres.';
    return;
  }
  loading.value = true;
  error.value = null;
  try {
    await auth.resetPassword({ token: token.value, password: password.value });
    status.value = 'done';
    setTimeout(() => router.push({ name: 'login' }), 1500);
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Ocorreu um erro inesperado.';
    // Token pode ter expirado entretanto.
    if (err instanceof ApiError && err.code === 'INVALID_OR_EXPIRED_TOKEN') {
      status.value = 'invalid';
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="reset">
    <div class="reset__content k-fade-up">
      <header class="reset__head">
        <KLogo :size="48" with-wordmark class="reset__logo" />
        <h1 class="reset__title">Redefinir senha</h1>
      </header>

      <!-- 1) Pedido por email -->
      <form v-if="status === 'request'" class="reset__form" @submit.prevent="onRequest">
        <p class="reset__subtitle">Indique o email da sua conta e enviaremos um link.</p>
        <BaseInput
          v-model="email"
          type="email"
          label="Email"
          placeholder="seu@email.com"
          accent="green"
          autocomplete="email"
          :icon="Mail"
          required
        />
        <p v-if="error" class="reset__error">{{ error }}</p>
        <BaseButton type="submit" variant="success" block :disabled="loading || !email">
          {{ loading ? 'A enviar…' : 'Enviar link' }}
        </BaseButton>
      </form>

      <!-- 2) Confirmação genérica (anti-enumeração) -->
      <div v-else-if="status === 'requested'" class="reset__panel">
        <p class="reset__subtitle">
          Se houver uma conta associada a <strong>{{ email }}</strong>, enviámos um link de
          redefinição. Verifique também a pasta de spam.
        </p>
        <BaseButton variant="ghost" block @click="router.push({ name: 'login' })">
          Voltar ao login
        </BaseButton>
      </div>

      <!-- 3) A validar o token -->
      <div v-else-if="status === 'validating'" class="reset__panel">
        <p class="reset__subtitle">A validar o link…</p>
      </div>

      <!-- 4) Token válido: nova senha -->
      <form v-else-if="status === 'valid'" class="reset__form" @submit.prevent="onReset">
        <p class="reset__subtitle">Defina a sua nova senha.</p>
        <BaseInput
          v-model="password"
          type="password"
          label="Nova senha"
          placeholder="Mínimo 8 caracteres"
          accent="green"
          autocomplete="new-password"
          :icon="Lock"
          required
        />
        <p v-if="error" class="reset__error">{{ error }}</p>
        <BaseButton type="submit" variant="success" block :disabled="loading">
          {{ loading ? 'A guardar…' : 'Redefinir senha' }}
        </BaseButton>
      </form>

      <!-- 5) Token inválido/expirado -->
      <div v-else-if="status === 'invalid'" class="reset__panel">
        <p class="reset__error">Este link é inválido ou já expirou.</p>
        <BaseButton variant="success" block @click="status = 'request'">
          Pedir um novo link
        </BaseButton>
      </div>

      <!-- 6) Concluído -->
      <div v-else class="reset__panel">
        <p class="reset__subtitle">Senha redefinida. A redirecionar para o login…</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reset {
  min-height: 100vh;
  background: var(--k-gradient-login);
  display: flex;
  justify-content: center;
}
.reset__content {
  width: 100%;
  max-width: 28rem;
  padding: 3rem 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.reset__head {
  text-align: center;
  margin-bottom: 2rem;
}
.reset__logo {
  margin-bottom: 1.5rem;
}
.reset__title {
  margin: 0;
  font-size: 1.625rem;
  font-weight: 600;
  color: var(--k-ink, #1a2238);
}
.reset__form,
.reset__panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.reset__subtitle {
  margin: 0;
  font-size: 0.875rem;
  color: var(--k-gray-500);
  text-align: center;
}
.reset__error {
  margin: 0;
  font-size: 0.85rem;
  color: #d4183d;
  text-align: center;
}
</style>
