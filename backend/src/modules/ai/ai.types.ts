export interface AIClassificationResult {
  category: string;
  confidence: number;
}

export interface BatchClassificationItem {
  content: string;
  title?: string;
  id?: string;
}

export interface BatchClassificationResult extends AIClassificationResult {
  id?: string;
}

export type PolicyCategory =
  | 'DADOS PESSOAIS GERAIS'
  | 'DADOS FINANCEIROS'
  | 'DADOS LOCALIZACAO'
  | 'COOKIES TRACKING'
  | 'MARKETING PUBLICIDADE'
  | 'COMPARTILHAMENTO TERCEIROS'
  | 'SEGURANCA PROTECAO'
  | 'DIREITOS USUARIO'
  | 'RETENCAO DADOS'
  | 'MENORES IDADE'
  | 'TRANSFERENCIA INTERNACIONAL'
  | 'OUTROS';

export interface CategoryDescription {
  category: PolicyCategory;
  description: string;
}
