<script setup lang="ts">
import BaseButton from '@/shared/components/BaseButton.vue';
import { reactive } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuthForm } from '../composables/useAuthForm';

const { loading, error, submit, auth } = useAuthForm();
const form = reactive({ email: '', password: '' });

function onSubmit() {
  submit(() => auth.login({ ...form }));
}
</script>

<template>
  <section class="auth-card">
    <h1>Entrar</h1>
    <form @submit.prevent="onSubmit">
      <label>
        Email
        <input v-model="form.email" type="email" required autocomplete="email" />
      </label>
      <label>
        Password
        <input v-model="form.password" type="password" required autocomplete="current-password" />
      </label>
      <p v-if="error" class="auth-error">{{ error }}</p>
      <BaseButton type="submit" :disabled="loading">
        {{ loading ? 'A entrar…' : 'Entrar' }}
      </BaseButton>
    </form>
    <p>Ainda não tens conta? <RouterLink :to="{ name: 'register' }">Criar conta</RouterLink></p>
  </section>
</template>

<style scoped>
.auth-card {
  max-width: 360px;
  margin: 3rem auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.9rem;
}
input {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 6px;
}
.auth-error {
  color: #c0392b;
  font-size: 0.9rem;
}
</style>
