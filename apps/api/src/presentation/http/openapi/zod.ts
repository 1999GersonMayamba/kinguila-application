import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

// Estende o Zod com `.openapi(...)` (metadados para o spec). Idempotente.
// Importa `z` a partir DESTE módulo na camada openapi para garantir a extensão.
extendZodWithOpenApi(z);

export { z };
