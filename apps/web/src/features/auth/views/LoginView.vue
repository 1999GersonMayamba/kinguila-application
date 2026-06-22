<script setup lang="ts">
import BaseButton from '@/shared/components/BaseButton.vue';
import BaseInput from '@/shared/components/BaseInput.vue';
import KLogo from '@/shared/components/KLogo.vue';
import { Lock, Mail } from 'lucide-vue-next';
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import SocialLoginButtons from '../components/SocialLoginButtons.vue';
import { useAuthForm } from '../composables/useAuthForm';

const router = useRouter();
const { loading, error, submit, auth } = useAuthForm();
const form = reactive({ email: '', password: '' });

function onSubmit() {
  submit(() => auth.login({ ...form }));
}
</script>

<template>
  <div class="login">
    <div class="login__content">
      <header class="login__head k-fade-up">
        <KLogo :size="48" with-wordmark class="login__logo" />
        <h1 class="login__title">Bem-vindo de volta</h1>
        <p class="login__subtitle">Entre para acessar sua conta</p>
      </header>

      <div class="login__card k-fade-up">
        <form class="login__form" @submit.prevent="onSubmit">
          <BaseInput
            v-model="form.email"
            type="email"
            label="Email"
            label-variant="muted"
            placeholder="seu@email.com"
            autocomplete="email"
            :icon="Mail"
            required
          />

          <BaseInput
            v-model="form.password"
            type="password"
            label="Senha"
            label-variant="muted"
            placeholder="••••••••"
            autocomplete="current-password"
            :icon="Lock"
            required
          >
            <template #labelAction>
              <button type="button" class="login__forgot">Esqueceu?</button>
            </template>
          </BaseInput>

          <p v-if="error" class="login__error">{{ error }}</p>

          <BaseButton type="submit" variant="primary" block :disabled="loading">
            {{ loading ? 'A entrar…' : 'Entrar' }}
          </BaseButton>

          <div class="login__divider">
            <span></span>
            <small>ou continue com</small>
            <span></span>
          </div>

          <SocialLoginButtons />
        </form>
      </div>

      <button class="login__create" type="button" @click="router.push({ name: 'register' })">
        Criar conta →
      </button>
    </div>
  </div>
</template>

<style scoped>
.login {
  min-height: 100vh;
  background: var(--k-gradient-login);
  display: flex;
  justify-content: center;
}
.login__content {
  width: 100%;
  max-width: 28rem;
  padding: 3rem 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.login__head {
  text-align: center;
  margin-bottom: 2rem;
}
.login__logo {
  margin-bottom: 1.5rem;
}
.login__title {
  margin: 0 0 0.5rem;
  font-size: 1.625rem;
  font-weight: 600;
  color: var(--k-ink);
}
.login__subtitle {
  margin: 0;
  font-size: 0.875rem;
  color: var(--k-gray-500);
}
.login__card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(6px);
  border-radius: var(--k-radius-2xl);
  padding: 1.5rem;
  box-shadow: var(--k-shadow-soft);
}
.login__form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.login__forgot {
  background: none;
  border: none;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--k-gray-400);
  cursor: pointer;
}
.login__forgot:hover {
  color: var(--k-navy);
}
.login__error {
  margin: 0;
  font-size: 0.85rem;
  color: var(--k-destructive, #d4183d);
}
.login__divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.login__divider span {
  flex: 1;
  height: 1px;
  background: var(--k-gray-200);
}
.login__divider small {
  font-size: 0.75rem;
  color: var(--k-gray-400);
}
.login__create {
  margin: 1.5rem auto 0;
  background: none;
  border: none;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--k-navy);
  cursor: pointer;
}
.login__create:hover {
  opacity: 0.8;
}
</style>
