import { AppError } from '@/core/webserver/app-error';
import { PoliciesRepository } from './policies.repository';
import {
  IPolicy,
  IPolicyRepository,
  IPolicySearchParams,
  IPolicySearchResult
} from './policies.types';

export class PoliciesService {
  private repository: IPolicyRepository;

  constructor() {
    this.repository = new PoliciesRepository();
  }

  public async createPolicy(policy: IPolicy): Promise<IPolicy> {
    return await this.repository.save(policy);
  }

  public async getAllPolicies(): Promise<IPolicy[]> {
    return await this.repository.findAll();
  }

  public async searchPolicies(
    term: string,
    page?: number,
    page_size?: number
  ): Promise<IPolicySearchResult> {
    const searchParams: IPolicySearchParams = {
      term,
      page,
      page_size
    };
    return await this.repository.search(searchParams);
  }

  public async getPolicyById(id: string): Promise<IPolicy> {
    const policy = await this.repository.findById(id);
    if (!policy) {
      throw new AppError('Política não encontrada', 404);
    }
    return policy;
  }

  public async updatePolicy(
    id: string,
    policy: Partial<IPolicy>
  ): Promise<IPolicy | null> {
    await this.getPolicyById(id);
    return await this.repository.update(id, policy);
  }

  public async deletePolicy(id: string): Promise<boolean> {
    await this.getPolicyById(id);
    return await this.repository.delete(id);
  }
}
