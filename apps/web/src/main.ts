import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';
import { useAuthStore } from './features/auth/stores/auth.store';
import router from './router';
import './shared/styles/base.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// Tenta restaurar a sessão antes de montar, para evitar "flash" de não-autenticado.
const auth = useAuthStore(pinia);
auth.restore().finally(() => {
  app.mount('#app');
});
