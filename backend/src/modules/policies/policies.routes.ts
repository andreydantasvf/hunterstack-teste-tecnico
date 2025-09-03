import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { PoliciesController } from './policies.controller';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { errorResponseSchema } from '@/core/webserver/error.schema';
import {
  policiesListResponseSchema,
  policyIdSchema,
  policyResponseSchema
} from './policies.schema';

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
          summary: 'Lista todas as políticas de privacidade',
          description:
            'Retorna uma lista de todas as políticas de privacidade disponíveis.',
          response: {
            200: policiesListResponseSchema,
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
            400: errorResponseSchema
          }
        }
      },
      (request, reply) => this.controller.getPolicyById(request, reply)
    );
  };
}
