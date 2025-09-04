import axios from 'axios';
import * as cheerio from 'cheerio';
import * as puppeteer from 'puppeteer';
import { IPolicy } from '../policies/policies.types';
import { IScrapingResult } from './scraping.types';
import { delay } from '@/utils/delay-function';
import { isValidUrl } from '@/utils/check-url';

export class ScrapingService {
  private browser: puppeteer.Browser | null = null;

  // URLs pré-definidas para teste
  private readonly predefinedUrls = [
    'https://policies.google.com/privacy',
    'https://www.facebook.com/privacy/policy',
    'https://www.microsoft.com/privacy/privacystatement',
    'https://www.apple.com/privacy/privacy-policy',
    'https://www.amazon.com/gp/help/customer/display.html?nodeId=468496'
  ];

  public async scrapePolicyFromURL(
    url: string,
    preferredMethod?: 'axios' | 'puppeteer'
  ): Promise<IScrapingResult> {
    try {
      if (!isValidUrl(url)) {
        return { success: false, error: 'URL inválida fornecida' };
      }

      if (preferredMethod === 'axios') {
        return await this.scrapeWithAxios(url);
      }

      if (preferredMethod === 'puppeteer') {
        return await this.scrapeWithPuppeteer(url);
      }

      const simpleResult = await this.scrapeWithAxios(url);
      if (simpleResult.success) {
        return simpleResult;
      }

      return await this.scrapeWithPuppeteer(url);
    } catch (error) {
      return {
        success: false,
        error: `Erro ao fazer scraping da URL ${url}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  }

  public async scrapeMultipleUrls(urls?: string[]): Promise<IScrapingResult[]> {
    const urlsToScrape = urls || this.predefinedUrls;
    const results: IScrapingResult[] = [];

    for (const url of urlsToScrape) {
      if (!isValidUrl(url)) {
        results.push({ success: false, error: 'URL inválida fornecida' });
        continue;
      }

      // eslint-disable-next-line
      console.log(`Fazendo scraping de: ${url}`);
      const result = await this.scrapePolicyFromURL(url);
      results.push(result);

      await delay(2000);
    }

    return results;
  }

  private async scrapeWithAxios(url: string): Promise<IScrapingResult> {
    try {
      const response = await axios.get(url, {
        timeout: 15000,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          Connection: 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        }
      });

      const $ = cheerio.load(response.data);
      const policyData = this.extractPolicyData($, url, 'axios');

      return {
        success: true,
        data: policyData
      };
    } catch (error) {
      return {
        success: false,
        error: `Axios falhou: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  }

  private async scrapeWithPuppeteer(url: string): Promise<IScrapingResult> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      );
      await page.setViewport({ width: 1366, height: 768 });

      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const resourceType = req.resourceType();
        if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
          req.abort();
        } else {
          req.continue();
        }
      });

      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      await this.handleCookieConsent(page);
      await delay(3000);

      const content = await page.content();
      const $ = cheerio.load(content);
      const policyData = this.extractPolicyData($, url, 'puppeteer');

      return {
        success: true,
        data: policyData
      };
    } catch (error) {
      return {
        success: false,
        error: `Puppeteer falhou: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    } finally {
      await page.close();
    }
  }

  private extractPolicyData(
    $: cheerio.CheerioAPI,
    url: string,
    method: 'axios' | 'puppeteer'
  ): IPolicy {
    $(
      'script, style, nav, header, footer, aside, .sidebar, .navigation, .menu, .ads, .advertisement, .cookie-banner, .cookie-notice'
    ).remove();

    const contentSelectors = [
      'div[class*="privacy"]',
      'div[class*="policy"]',
      'section[class*="privacy"]',
      'section[class*="policy"]',
      'article[class*="privacy"]',
      'article[class*="policy"]',
      '.privacy-policy-content',
      '.policy-content',
      '.privacy-content',
      '[role="main"]',
      'main',
      '.main-content',
      '.content',
      '#content',
      'article'
    ];

    let content = '';
    const title = $('title').text().trim() || this.extractTitle($) || '';

    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length) {
        element
          .find(
            'nav, header, footer, aside, .sidebar, .navigation, .menu, .ads, .advertisement, .cookie-banner'
          )
          .remove();

        const elementText = element.text().trim();
        if (elementText.length > content.length && elementText.length > 500) {
          content = elementText;
        }
      }
    }

    if (!content || content.length < 1000) {
      $(
        'button, input, select, textarea, .btn, .button, .link, .social, .share'
      ).remove();

      content = $('body').text().trim();
    }

    return {
      source_url: url,
      title: this.cleanAndOptimizeTitle(title),
      content: this.cleanAndOptimizeContent(content),
      category: '', // Será preenchido por outro serviço de IA
      method
    };
  }

  private cleanAndOptimizeTitle(title: string): string {
    if (!title) return '';

    const cleanedTitle = title
      .replace(/\s*\|\s*.*$/, '')
      .replace(/\s*-\s*.*$/, '')
      .replace(/\s*–\s*.*$/, '')
      .trim();

    return cleanedTitle || title;
  }

  private extractTitle($: cheerio.CheerioAPI): string {
    const titleSelectors = [
      'h1',
      '.page-title',
      '.policy-title',
      '.privacy-title',
      '[class*="title"]'
    ];

    for (const selector of titleSelectors) {
      const element = $(selector).first();
      if (element.length && element.text().trim()) {
        return element.text().trim();
      }
    }

    return '';
  }

  private cleanAndOptimizeContent(content: string): string {
    if (!content) return '';

    let cleanedContent = content
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .replace(/\t+/g, ' ')
      .trim();

    const unwantedPatterns = [
      /(?:cookie|privacidade|política)\s+(?:settings|configurações)/gi,
      /(?:aceitar|accept)\s+(?:cookies|todos)/gi,
      /(?:back to top|voltar ao topo)/gi,
      /(?:share|compartilhar)\s+(?:this|este)/gi,
      /(?:print|imprimir)\s+(?:page|página)/gi,
      /(?:download|baixar)\s+(?:pdf)/gi,
      /(?:last updated|última atualização).*?(?:\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4})/gi
    ];

    unwantedPatterns.forEach((pattern) => {
      cleanedContent = cleanedContent.replace(pattern, '');
    });

    const sentences = cleanedContent.split(/[.!?]/);
    const meaningfulSentences = sentences.filter((sentence) => {
      const trimmed = sentence.trim();
      return (
        trimmed.length > 50 &&
        !trimmed.toLowerCase().includes('javascript') &&
        !trimmed.toLowerCase().includes('error') &&
        !trimmed.toLowerCase().includes('404')
      );
    });

    const finalContent = meaningfulSentences.join('. ').trim();

    return finalContent;
  }

  private async handleCookieConsent(page: puppeteer.Page): Promise<void> {
    try {
      const acceptSelectors = [
        'button[id*="accept"]',
        'button[class*="accept"]',
        'button:contains("Aceitar")',
        'button:contains("Accept")',
        'button:contains("Concordo")',
        'button:contains("OK")',
        '[data-testid*="accept"]'
      ];

      for (const selector of acceptSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 3000 });
          await page.click(selector);
          await delay(1000);
          break;
        } catch {
          continue;
        }
      }
    } catch {
      // Ignora erros ao lidar com o consentimento de cookies
    }
  }

  private async getBrowser(): Promise<puppeteer.Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
    }
    return this.browser;
  }

  public async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  public async scrapePredefinedUrls(): Promise<IScrapingResult[]> {
    return this.scrapeMultipleUrls();
  }
}
