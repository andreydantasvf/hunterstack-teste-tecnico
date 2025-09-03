import { AppError } from '@/core/webserver/app-error';
import { AIService } from '../ai/ai.service';
import { PoliciesService } from '../policies/policies.service';
import { ScrapingService } from '../scraping/scraping.service';

export class IngestionService {
  private scrapingService: ScrapingService;
  private aiService: AIService;
  private policiesService: PoliciesService;

  constructor() {
    this.scrapingService = new ScrapingService();
    this.aiService = new AIService();
    this.policiesService = new PoliciesService();
  }

  public async ingestPolicyFromUrl(url: string) {
    try {
      const scrapingResult =
        await this.scrapingService.scrapePolicyFromURL(url);

      if (!scrapingResult.success || !scrapingResult.data) {
        throw new AppError(`Falha no scraping: ${scrapingResult.error}`, 400);
      }

      const { title, content, method } = scrapingResult.data;

      const classificationResult = await this.aiService.classifyPolicyContent(
        content,
        title
      );

      const newPolicy = await this.policiesService.createPolicy({
        source_url: url,
        title,
        content,
        category: classificationResult.category,
        method
      });

      return newPolicy;
    } catch (error) {
      throw new AppError(
        `Falha na ingestão da política: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        500
      );
    }
  }
}
