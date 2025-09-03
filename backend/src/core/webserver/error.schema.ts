import z from 'zod';

export const errorResponseSchema = z.object({
  message: z.string().describe('Mensagem de erro descritiva'),
  statusCode: z.number().min(400).max(599).describe('Código de status HTTP'),
  error: z.any().describe('Detalhes do erro')
});
