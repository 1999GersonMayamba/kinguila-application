<script setup lang="ts">
import BaseButton from '@/shared/components/BaseButton.vue';
import { reactive } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuthForm } from '../composables/useAuthForm';

const { loading, error, submit, auth } = useAuthForm();
const form = reactive({ name: '', email: '', password: '' });

function onSubmit() {
  submit(() => auth.register({ ...form }));
}
</script>

<template>
  <section class="auth-card">
    <h1>Criar conta</h1>
    <form @submit.prevent="onSubmit">
      <label>
        Nome
        <input v-model="form.name" type="text" required autocomplete="name" />
      </label>
      <label>
        Email
        <input v-model="form.email" type="email" required autocomplete="email" />
      </label>
      <label>
        Password
        <input v-model="form.password" type="password" required minlength="8" autocomplete="new-password" />
      </label>
      <p v-if="error" class="auth-error">{{ error }}</p>
      <BaseButton type="submit" :disabled="loading">
        {{ loading ? 'A criar…' : 'Criar conta' }}
      </BaseButton>
    </form>
    <p>Já tens conta? <RouterLink :to="{ name: 'login' }">Entrar</RouterLink></p>
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
