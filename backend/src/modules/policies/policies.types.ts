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
