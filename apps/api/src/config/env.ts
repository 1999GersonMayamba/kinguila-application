import { z } from 'zod';

/**
 * Lê e valida as variáveis de ambiente. Falha cedo (no arranque) se faltar algo
 * obrigatório, evitando erros obscuros em runtime.
 */
const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(3333),
    CORS_ORIGINS: z
      .string()
      .default('http://localhost:5173')
      .transform((value) => value.split(',').map((origin) => origin.trim())),
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(16, 'JWT_SECRET deve ter pelo menos 16 caracteres'),
    JWT_ACCESS_TOKEN_TTL: z.string().default('15m'),
    JWT_REFRESH_TOKEN_TTL: z.string().default('7d'),

    // Integração de referência (taxas de câmbio). Opcionais: a app arranca sem elas.
    EXCHANGE_RATE_API_URL: z.string().url().default('https://api.exchangerate.example/'),
    EXCHANGE_RATE_API_KEY: z.string().default(''),

    // Envio de email (Resend) e fluxos de verificação/reset.
    RESEND_API_URL: z.string().url().default('https://api.resend.com/'),
    RESEND_API_KEY: z.string().default(''),
    EMAIL_FROM: z.string().default('Kinguila <no-reply@kinguila.app>'),
    // URL base do front-end, usada para montar o link de reset de senha.
    WEB_APP_URL: z.string().url().default('http://localhost:5173'),
    EMAIL_CODE_TTL: z.string().default('15m'),
    PASSWORD_RESET_TOKEN_TTL: z.string().default('1h'),
    EMAIL_RESEND_RATE_LIMIT_SECONDS: z.coerce.number().int().positive().default(60),
    EMAIL_CODE_MAX_ATTEMPTS: z.coerce.number().int().positive().default(5),
  })
  .superRefine((value, ctx) => {
    // Em produção, os segredos de email passam a ser obrigatórios (o default '' só
    // serve para arrancar localmente sem enviar emails reais).
    if (value.NODE_ENV !== 'production') {
      return;
    }
    if (!value.RESEND_API_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['RESEND_API_KEY'],
        message: 'Obrigatória em produção',
      });
    }
    if (!value.EMAIL_FROM) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['EMAIL_FROM'],
        message: 'Obrigatória em produção',
      });
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  throw new Error(`Variáveis de ambiente inválidas:\n${issues}`);
}

export const env = parsed.data;
export type Env = typeof env;
