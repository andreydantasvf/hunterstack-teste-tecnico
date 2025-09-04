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

export interface IPolicySearchParams {
  term?: string;
  page?: number;
  page_size?: number;
}

export interface IPolicySearchResult {
  policies: IPolicy[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface IPolicyRepository {
  save(policy: IPolicy): Promise<IPolicy>;
  findById(id: string): Promise<IPolicy | null>;
  findAll(): Promise<IPolicy[]>;
  search(params: IPolicySearchParams): Promise<IPolicySearchResult>;
  update(id: string, policy: Partial<IPolicy>): Promise<IPolicy | null>;
  delete(id: string): Promise<boolean>;
}
