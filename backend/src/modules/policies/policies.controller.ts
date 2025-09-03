import { FastifyReply, FastifyRequest } from 'fastify';
import { PoliciesService } from './policies.service';

export class PoliciesController {
  private policiesService: PoliciesService;

  constructor() {
    this.policiesService = new PoliciesService();
  }

  public async listAllPolicies(
    _request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const policies = this.policiesService.getAllPolicies();
    reply.send({
      success: true,
      data: policies
    });
  }

  public async getPolicyById(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const { id } = request.params as { id: string };
    const policy = this.policiesService.getPolicyById(id);
    reply.send({
      success: true,
      data: policy
    });
  }
}
