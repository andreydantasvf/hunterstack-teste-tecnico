import { IPolicy } from '../policies/policies.types';

export interface IScrapingResult {
  success: boolean;
  data?: IPolicy;
  error?: string;
}
