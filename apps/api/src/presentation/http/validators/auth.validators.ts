import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome demasiado curto').max(120),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'A password deve ter pelo menos 8 caracteres').max(128),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Password obrigatória'),
});
