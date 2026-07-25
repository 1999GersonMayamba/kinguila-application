import { z } from 'zod';

export const listUsersQuerySchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  role: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
});

export const updateUserSchema = z
  .object({
    name: z.string().min(2, 'Nome demasiado curto').max(120).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Indica pelo menos um campo para atualizar',
  });

export const setUserDisabledSchema = z.object({
  disabled: z.boolean(),
});

export const userIdParamSchema = z.object({
  id: z.string().uuid(),
});
