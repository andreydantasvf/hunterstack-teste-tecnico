import { FastifyReply, FastifyRequest } from 'fastify';
import { PoliciesService } from './policies.service';

export class PoliciesController {
  private policiesService: PoliciesService;

  constructor() {
    this.policiesService = new PoliciesService();
  }

  public async listAllPolicies(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const query = request.query as {
      term?: string;
      page?: string;
      page_size?: string;
    };
    const { term, page, page_size } = query;

    if (term) {
      const result = await this.policiesService.searchPolicies(
        term,
        page ? Number(page) : undefined,
        page_size ? Number(page_size) : undefined
      );

      reply.send({
        success: true,
        data: result.policies,
        pagination: {
          page: result.page,
          page_size: result.page_size,
          total: result.total,
          total_pages: result.total_pages
        }
      });
      return;
    }

    const policies = await this.policiesService.getAllPolicies();
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
    const policy = await this.policiesService.getPolicyById(id);
    reply.send({
      success: true,
      data: policy
    });
  }

  public async downloadPolicy(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const { id } = request.params as { id: string };
    const { format } = request.query as { format: string };

    const policy = await this.policiesService.getPolicyById(id);

    if (format === 'json') {
      const filename = `policy-${policy.id}.json`;

      reply
        .header('Content-Type', 'application/json')
        .header('Content-Disposition', `attachment; filename="${filename}"`)
        .send(policy);
    } else {
      reply.status(400).send({
        success: false,
        error: 'Formato não suportado. Use format=json'
      });
    }
  }
}
