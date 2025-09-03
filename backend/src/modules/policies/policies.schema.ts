import { z } from 'zod';

export const policySchema = z.object({
  id: z.string().uuid().optional(),
  title: z
    .string()
    .min(1, 'Título é obrigatório')
    .max(500, 'Título muito longo'),
  source_url: z.string().url('URL inválida'),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  method: z.enum(['axios', 'puppeteer']).optional()
});

export const createPolicySchema = z.object({
  title: z
    .string()
    .min(1, 'Título é obrigatório')
    .max(500, 'Título muito longo'),
  source_url: z.string().url('URL inválida'),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  method: z.enum(['axios', 'puppeteer']).optional()
});

export const updatePolicySchema = z.object({
  title: z
    .string()
    .min(1, 'Título é obrigatório')
    .max(500, 'Título muito longo')
    .optional(),
  source_url: z.string().url('URL inválida').optional(),
  content: z.string().min(1, 'Conteúdo é obrigatório').optional(),
  category: z.string().min(1, 'Categoria é obrigatória').optional(),
  method: z.enum(['axios', 'puppeteer']).optional()
});

export const policyIdSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID válido')
});

export const policyQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().min(1)).optional(),
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(1).max(100))
    .optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['title', 'createdAt', 'updatedAt', 'category']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

export const policyResponseSchema = z.object({
  success: z.literal(true),
  data: policySchema
});

export const policiesListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(policySchema),
  pagination: z
    .object({
      page: z.number().int().min(1),
      limit: z.number().int().min(1),
      total: z.number().int().min(0),
      totalPages: z.number().int().min(0)
    })
    .optional()
});
