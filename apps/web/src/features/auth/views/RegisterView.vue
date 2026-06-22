<script setup lang="ts">
import BaseButton from '@/shared/components/BaseButton.vue';
import BaseInput from '@/shared/components/BaseInput.vue';
import { X } from 'lucide-vue-next';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthForm } from '../composables/useAuthForm';

const router = useRouter();
const { loading, error, submit, auth } = useAuthForm();

// `phone` é apenas visual nesta fase (o RegisterRequest ainda não o inclui).
const form = reactive({ name: '', email: '', phone: '', password: '' });
const pendingEmail = ref('');

async function onSubmit() {
  // O registo não autentica: encaminha para a verificação de email. O email vai
  // em router state (não na query) para não vazar em logs/histórico.
  await submit(
    async () => {
      const result = await auth.register({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      pendingEmail.value = result.email;
    },
    { redirectTo: null },
  );
  if (!error.value && pendingEmail.value) {
    router.push({ name: 'verify-email', state: { email: pendingEmail.value } });
  }
}
</script>

<template>
  <div class="register">
    <h2 class="register__brand">Kinguila</h2>
    <button class="register__close" type="button" aria-label="Fechar" @click="router.push({ name: 'welcome' })">
      <X :size="24" />
    </button>

    <div class="register__content k-fade-up">
      <header class="register__head">
        <h1 class="register__title">Criar conta.</h1>
        <p class="register__sub">
          Já tem uma conta?
          <button type="button" class="register__link" @click="router.push({ name: 'login' })">
            Entrar
          </button>
        </p>
      </header>

      <form class="register__form" @submit.prevent="onSubmit">
        <BaseInput
          v-model="form.name"
          label="Nome completo"
          placeholder="Maria Silva"
          accent="green"
          autocomplete="name"
          required
        />
        <BaseInput
          v-model="form.email"
          type="email"
          label="Endereço de e-mail"
          placeholder="seu@email.com"
          accent="green"
          autocomplete="email"
          required
        />
        <BaseInput
          v-model="form.phone"
          type="tel"
          label="Telefone"
          placeholder="+55 11 99999-0000"
          accent="green"
          autocomplete="tel"
          required
        />
        <BaseInput
          v-model="form.password"
          type="password"
          label="Senha"
          placeholder="Mínimo 8 caracteres"
          accent="green"
          autocomplete="new-password"
          required
        />

        <p v-if="error" class="register__error">{{ error }}</p>

        <BaseButton type="submit" variant="success" block :disabled="loading">
          {{ loading ? 'A criar…' : 'Criar conta' }}
        </BaseButton>

        <p class="register__terms">
          Ao criar uma conta, você concorda com nossos
          <button type="button" class="register__link">Termos de Uso</button>
          e
          <button type="button" class="register__link">Política de Privacidade</button>
        </p>
      </form>
    </div>
  </div>
</template>

<style scoped>
.register {
  position: relative;
  min-height: 100vh;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}
.register__brand {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--k-navy);
}
.register__close {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: none;
  border: none;
  color: var(--k-gray-400);
  cursor: pointer;
}
.register__close:hover {
  color: var(--k-gray-600);
}
.register__content {
  width: 100%;
  max-width: 28rem;
}
.register__head {
  text-align: center;
  margin-bottom: 2rem;
}
.register__title {
  margin: 0 0 0.75rem;
  font-size: 1.875rem;
  font-weight: 800;
  color: var(--k-navy);
}
.register__sub {
  margin: 0;
  font-size: 0.875rem;
  color: var(--k-gray-500);
}
.register__form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.register__error {
  margin: 0;
  font-size: 0.85rem;
  color: #d4183d;
}
.register__terms {
  margin: 0.5rem 0 0;
  text-align: center;
  font-size: 0.75rem;
  color: var(--k-gray-500);
}
.register__link {
  background: none;
  border: none;
  padding: 0;
  font-size: inherit;
  font-weight: 600;
  color: var(--k-navy);
  text-decoration: underline;
  cursor: pointer;
}
</style>
