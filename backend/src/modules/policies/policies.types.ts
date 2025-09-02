export interface IPolicy {
  id?: string;
  title: string;
  source_url: string;
  content: string;
  category: string;
  createdAt?: Date;
  updatedAt?: Date;
  method?: 'axios' | 'puppeteer';
}

export interface IPolicyRepository {
  save(policy: IPolicy): Promise<IPolicy>;
  findById(id: string): Promise<IPolicy | null>;
  findAll(): Promise<IPolicy[]>;
  update(id: string, policy: Partial<IPolicy>): Promise<IPolicy | null>;
  delete(id: string): Promise<boolean>;
}
