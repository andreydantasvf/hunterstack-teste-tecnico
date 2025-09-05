export const POLICY_CATEGORIES = [
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
] as const;

export type PolicyCategory = (typeof POLICY_CATEGORIES)[number];

export const POLICY_CATEGORIES_ARRAY: [PolicyCategory, ...PolicyCategory[]] = [
  ...POLICY_CATEGORIES
];

export const CATEGORY_COLORS: Record<PolicyCategory, string> = {
  'DADOS PESSOAIS GERAIS':
    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'DADOS FINANCEIROS':
    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'DADOS LOCALIZACAO':
    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  'COOKIES TRACKING':
    'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  'MARKETING PUBLICIDADE':
    'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
  'COMPARTILHAMENTO TERCEIROS':
    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  'SEGURANCA PROTECAO':
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
  'DIREITOS USUARIO':
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  'RETENCAO DADOS':
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  'MENORES IDADE':
    'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300',
  'TRANSFERENCIA INTERNACIONAL':
    'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
  OUTROS: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
};

export const getCategoryColor = (category: string): string => {
  return (
    CATEGORY_COLORS[category as PolicyCategory] || CATEGORY_COLORS['OUTROS']
  );
};
