import OpenAI from 'openai';
import { AIClassificationResult } from './ai.types';
import { AppError } from '@/core/webserver/app-error';
import { delay } from '@/utils/delay-function';

export class AIService {
  private openai: OpenAI;

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
    if (!process.env.OPENAI_API_KEY) {
      throw new Error(
        'OPENAI_API_KEY não está configurada nas variáveis de ambiente'
      );
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  public async classifyPolicyContent(
    content: string,
    title?: string
  ): Promise<AIClassificationResult> {
    try {
      const prompt = this.buildClassificationPrompt(content, title);

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'Você é um especialista em análise de políticas de privacidade e proteção de dados. Sua tarefa é classificar o conteúdo fornecido em uma das categorias pré-definidas.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new AppError('Resposta vazia da API OpenAI', 500);
      }

      return this.parseAIResponse(response);
    } catch (error) {
      // eslint-disable-next-line
      console.log(
        `Erro ao classificar conteúdo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
      return {
        category: 'OUTROS',
        confidence: 0
      };
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
      Analise o seguinte conteúdo de política de privacidade e classifique-o na categoria mais apropriada.

      ${title ? `TÍTULO: ${title}\n` : ''}

      CONTEÚDO:
      ${content.substring(0, 4000)} ${content.length > 4000 ? '...' : ''}

      CATEGORIAS DISPONÍVEIS:
      ${categoriesDescription}

      Por favor, responda EXATAMENTE no seguinte formato JSON:
      {
        "category": "CATEGORIA_ESCOLHIDA",
        "confidence": 85,
      }

      Onde:
      - category: deve ser exatamente uma das categorias listadas acima
      - confidence: número de 0 a 100 indicando sua confiança na classificação
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
        throw new Error('Formato de resposta inválido');
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
      // eslint-disable-next-line
      console.log(
        `Erro ao processar resposta da IA: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
      return {
        category: 'OUTROS',
        confidence: 0
      };
    }
  }

  public getAvailableCategories(): string[] {
    return [...this.categories];
  }

  public getCategoryDescription(category: string): string {
    return this.getCategoryDescriptionInternal(category);
  }

  public async classifyMultipleContents(
    contents: Array<{ content: string; title?: string; id?: string }>
  ): Promise<Array<AIClassificationResult & { id?: string }>> {
    const results: Array<AIClassificationResult & { id?: string }> = [];

    for (const item of contents) {
      try {
        const result = await this.classifyPolicyContent(
          item.content,
          item.title
        );
        results.push({
          ...result,
          id: item.id
        });

        await delay(1000);
      } catch (error) {
        // eslint-disable-next-line
        console.log(
          `Erro ao classificar conteúdo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
        );
        results.push({
          category: 'OUTROS',
          confidence: 0,
          id: item.id
        });
      }
    }

    return results;
  }
}
