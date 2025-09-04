import { z } from 'zod';

export const policySchema = z.object({
  id: z.string().uuid().optional(),
  title: z
    .string()
    .min(1, 'Título é obrigatório')
    .max(500, 'Título muito longo')
    .describe('Título da política de privacidade'),
  source_url: z
    .string()
    .url('URL inválida')
    .describe('URL de origem da política'),
  content: z
    .string()
    .min(1, 'Conteúdo é obrigatório')
    .describe('Conteúdo da política'),
  category: z
    .string()
    .min(1, 'Categoria é obrigatória')
    .describe('Categoria da política'),
  createdAt: z.date().optional().describe('Data de criação da política'),
  updatedAt: z.date().optional().describe('Data de atualização da política'),
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
  id: z.string().uuid('ID deve ser um UUID válido').describe('ID da política')
});

export const downloadQuerySchema = z.object({
  format: z.enum(['json']).describe('Formato do arquivo para download')
});

export const policyQuerySchema = z.object({
  term: z
    .string()
    .optional()
    .describe('Termo de busca para title, content ou category'),
  page: z.string().transform(Number).pipe(z.number().int().min(1)).optional(),
  page_size: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(1).max(100))
    .optional()
});

export const policyResponseSchema = z.object({
  success: z.literal(true).describe('Indica se a resposta foi bem-sucedida'),
  data: policySchema
});

export const policiesListResponseSchema = z.object({
  success: z.literal(true).describe('Indica se a resposta foi bem-sucedida'),
  data: z.array(policySchema).describe('Lista de políticas de privacidade')
});

export const policiesSearchResponseSchema = z.object({
  success: z.literal(true).describe('Indica se a resposta foi bem-sucedida'),
  data: z.array(policySchema).describe('Lista de políticas de privacidade'),
  pagination: z.object({
    total: z.number().int().min(0).describe('Total de políticas encontradas'),
    page: z.number().int().min(1).describe('Página atual'),
    page_size: z.number().int().min(1).describe('Tamanho da página'),
    total_pages: z.number().int().min(0).describe('Total de páginas')
  })
});

export const deletePolicyResponseSchema = z.object({
  success: z.literal(true).describe('Indica se a resposta foi bem-sucedida'),
  data: null
});
