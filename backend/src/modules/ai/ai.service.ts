import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { AIClassificationResult } from './ai.types';
import { AppError } from '@/core/webserver/app-error';

export class AIService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  private readonly categories = [
    'DADOS PESSOAIS GERAIS',
    'DADOS FINANCEIROS',
    'DADOS LOCALIZACAO',
    'COOKIES TRACKING',
    'MARKETING PUBLICIDADE',
    'COMPARTILHAMENTO TERCEIROS',
    'SEGURANCA PROTECAO',
    'DIREITOS USUARIO',
    'RETENCAO DADOS',
    'MENORES IDADE',
    'TRANSFERENCIA INTERNACIONAL',
    'OUTROS'
  ];

  constructor() {
    if (!process.env.GOOGLE_AI_API_KEY) {
      throw new AppError(
        'GOOGLE_AI_API_KEY não está configurada nas variáveis de ambiente',
        500
      );
    }

    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite'
    });
  }

  public async classifyPolicyContent(
    content: string,
    title?: string
  ): Promise<AIClassificationResult> {
    try {
      const prompt = this.buildClassificationPrompt(content, title);

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      if (!response) {
        throw new AppError('Resposta vazia da API Google Gemini', 500);
      }

      return this.parseAIResponse(response);
    } catch (error) {
      throw new AppError(
        `Erro ao classificar conteúdo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        500
      );
    }
  }

  private buildClassificationPrompt(content: string, title?: string): string {
    const categoriesDescription = this.categories
      .map(
        (cat, index) =>
          `${index + 1}. ${cat}: ${this.getCategoryDescriptionInternal(cat)}`
      )
      .join('\n');

    return `
      Você é um especialista em análise de políticas de privacidade e proteção de dados. Sua tarefa é classificar o conteúdo fornecido em uma das categorias pré-definidas.

      Analise o seguinte conteúdo de política de privacidade e classifique-o na categoria mais apropriada.

      ${title ? `TÍTULO: ${title}\n` : ''}

      CONTEÚDO:
      ${content.substring(0, 4000)} ${content.length > 4000 ? '...' : ''}

      CATEGORIAS DISPONÍVEIS:
      ${categoriesDescription}

      Por favor, responda EXATAMENTE no seguinte formato JSON:
      {
        "category": "CATEGORIA_ESCOLHIDA",
        "confidence": 85
      }

      Onde:
      - category: deve ser exatamente uma das categorias listadas acima
      - confidence: número de 0 a 100 indicando sua confiança na classificação

      Responda apenas com o JSON, sem explicações adicionais.
    `;
  }

  private getCategoryDescriptionInternal(category: string): string {
    const descriptions: Record<string, string> = {
      'DADOS PESSOAIS GERAIS':
        'Coleta e uso de dados pessoais básicos (nome, email, telefone, etc.)',
      'DADOS FINANCEIROS':
        'Tratamento de informações financeiras, cartão de crédito, dados bancários',
      'DADOS LOCALIZACAO':
        'Coleta e uso de dados de geolocalização e localização do usuário',
      'COOKIES TRACKING':
        'Uso de cookies, pixels de rastreamento e tecnologias similares',
      'MARKETING PUBLICIDADE':
        'Uso de dados para marketing, publicidade direcionada e comunicação promocional',
      'COMPARTILHAMENTO TERCEIROS':
        'Compartilhamento de dados com parceiros, fornecedores ou terceiros',
      'SEGURANCA PROTECAO':
        'Medidas de segurança, proteção de dados e prevenção de fraudes',
      'DIREITOS USUARIO':
        'Direitos do titular dos dados conforme LGPD, GDPR (acesso, correção, exclusão)',
      'RETENCAO DADOS': 'Período de armazenamento e retenção de dados pessoais',
      'MENORES IDADE':
        'Políticas específicas para crianças e adolescentes menores de idade',
      'TRANSFERENCIA INTERNACIONAL':
        'Transferência de dados para outros países ou jurisdições',
      OUTROS: 'Outras políticas que não se enquadram nas categorias específicas'
    };

    return descriptions[category] || 'Descrição não disponível';
  }

  private parseAIResponse(response: string): AIClassificationResult {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new AppError('Formato de resposta inválido', 500);
      }

      const parsed = JSON.parse(jsonMatch[0]);

      if (!this.categories.includes(parsed.category)) {
        parsed.category = 'OUTROS';
      }

      if (
        typeof parsed.confidence !== 'number' ||
        parsed.confidence < 0 ||
        parsed.confidence > 100
      ) {
        parsed.confidence = 50; // valor padrão
      }

      return {
        category: parsed.category,
        confidence: parsed.confidence
      };
    } catch (error) {
      throw new AppError(
        `Erro ao processar resposta da IA: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        500
      );
    }
  }

  public getAvailableCategories(): string[] {
    return [...this.categories];
  }

  public getCategoryDescription(category: string): string {
    return this.getCategoryDescriptionInternal(category);
  }
}
