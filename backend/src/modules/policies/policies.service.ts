import { PoliciesRepository } from './policies.repository';
import { IPolicy, IPolicyRepository } from './policies.types';

export class PoliciesService {
  private repository: IPolicyRepository;

  constructor() {
    this.repository = new PoliciesRepository();
  }

  public async createPolicy(policy: IPolicy): Promise<IPolicy> {
    return this.repository.save(policy);
  }

  public async getAllPolicies(): Promise<IPolicy[]> {
    return this.repository.findAll();
  }

  public async getPolicyById(id: string): Promise<IPolicy | null> {
    return this.repository.findById(id);
  }

  public async updatePolicy(
    id: string,
    policy: Partial<IPolicy>
  ): Promise<IPolicy | null> {
    return this.repository.update(id, policy);
  }

  public async deletePolicy(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}
