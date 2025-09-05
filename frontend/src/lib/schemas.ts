import { z } from 'zod';
import { POLICY_CATEGORIES_ARRAY } from './constants';

export const policySchema = z.object({
  id: z.string().uuid(),
  title: z
    .string()
    .min(1, 'Título é obrigatório')
    .max(500, 'Título muito longo'),
  source_url: z.string().url('URL inválida'),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  category: z.enum(POLICY_CATEGORIES_ARRAY),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  method: z.enum(['axios', 'puppeteer']).optional()
});

export const createPolicySchema = z.object({
  title: z
    .string()
    .min(1, 'Título é obrigatório')
    .max(500, 'Título muito longo'),
  source_url: z.string().url('URL inválida'),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  category: z.enum(POLICY_CATEGORIES_ARRAY),
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
  category: z.enum(POLICY_CATEGORIES_ARRAY).optional(),
  method: z.enum(['axios', 'puppeteer']).optional()
});

export const policyQuerySchema = z.object({
  term: z.string().optional(),
  page: z.number().int().min(1).optional(),
  page_size: z.number().int().min(1).max(100).optional()
});

export const policyResponseSchema = z.object({
  success: z.literal(true),
  data: policySchema
});

export const policiesListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(policySchema)
});

export const policiesSearchResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(policySchema),
  pagination: z.object({
    total: z.number().int().min(0),
    page: z.number().int().min(1),
    page_size: z.number().int().min(1),
    total_pages: z.number().int().min(0)
  })
});

export const deletePolicyResponseSchema = z.object({
  success: z.literal(true),
  data: z.null()
});

export type Policy = z.infer<typeof policySchema>;
export type CreatePolicyRequest = z.infer<typeof createPolicySchema>;
export type UpdatePolicyRequest = z.infer<typeof updatePolicySchema>;
export type PolicyQuery = z.infer<typeof policyQuerySchema>;
export type PolicyResponse = z.infer<typeof policyResponseSchema>;
export type PoliciesListResponse = z.infer<typeof policiesListResponseSchema>;
export type PoliciesSearchResponse = z.infer<
  typeof policiesSearchResponseSchema
>;
export type DeletePolicyResponse = z.infer<typeof deletePolicyResponseSchema>;

export interface PolicyFilters {
  term?: string;
  page?: number;
  page_size?: number;
  category?: string;
}
