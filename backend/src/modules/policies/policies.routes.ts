import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { PoliciesController } from './policies.controller';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { errorResponseSchema } from '@/core/webserver/error.schema';
import {
  policiesSearchResponseSchema,
  policiesListResponseSchema,
  policyIdSchema,
  policySchema,
  policyResponseSchema,
  policyQuerySchema,
  downloadQuerySchema
} from './policies.schema';
import { z } from 'zod';

export class PoliciesRoutes {
  public prefix_route = '/policies';
  private controller: PoliciesController;

  constructor() {
    this.controller = new PoliciesController();
  }

  public routes = async (
    fastify: FastifyInstance,
    _options: FastifyPluginOptions
  ) => {
    const fastifyWithZod = fastify.withTypeProvider<ZodTypeProvider>();

    fastifyWithZod.get(
      '/',
      {
        schema: {
          tags: ['Políticas de Privacidade'],
          summary: 'Lista ou busca políticas de privacidade',
          description:
            'Retorna uma lista de todas as políticas de privacidade disponíveis ou filtra por termo de busca com paginação.',
          querystring: policyQuerySchema,
          response: {
            200: z.union([
              policiesListResponseSchema,
              policiesSearchResponseSchema
            ]),
            400: errorResponseSchema
          }
        }
      },
      (request, reply) => this.controller.listAllPolicies(request, reply)
    );

    fastifyWithZod.get(
      '/:id',
      {
        schema: {
          tags: ['Políticas de Privacidade'],
          summary: 'Detalhes da política de privacidade',
          description:
            'Retorna os detalhes de uma política de privacidade específica.',
          params: policyIdSchema,
          response: {
            200: policyResponseSchema,
            400: errorResponseSchema,
            404: errorResponseSchema
          }
        }
      },
      (request, reply) => this.controller.getPolicyById(request, reply)
    );

    fastifyWithZod.get(
      '/:id/download',
      {
        schema: {
          tags: ['Políticas de Privacidade'],
          summary: 'Download da política de privacidade',
          description:
            'Faz o download de uma política de privacidade específica em formato JSON.',
          params: policyIdSchema,
          querystring: downloadQuerySchema,
          response: {
            200: policySchema,
            400: errorResponseSchema,
            404: errorResponseSchema
          }
        }
      },
      (request, reply) => this.controller.downloadPolicy(request, reply)
    );
  };
}
