import { buildContainer } from './composition/container';
import { env } from './config/env';
import { createServer } from './presentation/http/server';

const container = buildContainer();
const app = createServer(container);

console.log(`🟢 Kinguila API a correr em http://localhost:${env.PORT} (${env.NODE_ENV})`);

export default {
  port: env.PORT,
  fetch: app.fetch,
};
