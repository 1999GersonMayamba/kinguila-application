import { z } from 'zod';

/**
 * Regra de força da password, partilhada por registo e reset. Máximo 72: limite
 * do argon2id (evita DoS de hashing com inputs enormes).
 */
const passwordSchema = z
  .string()
  .min(8, 'A password deve ter pelo menos 8 caracteres')
  .max(72, 'A password não pode exceder 72 caracteres');

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome demasiado curto').max(120),
  email: z.string().email('Email inválido'),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Password obrigatória'),
});

export const confirmEmailSchema = z.object({
  email: z.string().email('Email inválido'),
  code: z.string().regex(/^\d{6}$/, 'O código deve ter 6 dígitos'),
});

export const resendCodeSchema = z.object({
  email: z.string().email('Email inválido'),
});

export const requestPasswordResetSchema = z.object({
  email: z.string().email('Email inválido'),
});

export const validateResetTokenSchema = z.object({
  token: z.string().min(1, 'Token obrigatório'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token obrigatório'),
  password: passwordSchema,
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token obrigatório'),
});
