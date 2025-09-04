# Back-end - Sistema de Análise de Políticas de Privacidade

Esta é a API back-end para o sistema de análise automatizada de políticas de privacidade, desenvolvida como parte de um desafio técnico. A aplicação é construída com Node.js, Fastify, TypeScript e Prisma, integrando web scraping e inteligência artificial (Google Gemini) para classificação automática de conteúdo, seguindo as melhores práticas de desenvolvimento de software para garantir um código limpo, escalável e de fácil manutenção.

## Links Relacionados

- **[🏠 Projeto Principal](../)** - Raiz do repositório
- **[📖 Swagger Documentation](http://localhost:3333/docs)** - Documentação interativa da API
- **[🔗 API Base URL](http://localhost:3333)** - Endpoint base da API (desenvolvimento)
- **[⚙️ Configuração Docker](../docker-compose.yml)** - Setup completo com Docker
- **[🤖 Google Gemini API](https://ai.google.dev/)** - Documentação da API de IA utilizada

---

## Tabela de Conteúdos

- [Filosofia e Estrutura do Projeto](#filosofia-e-estrutura-do-projeto)
  - [Estrutura de Módulos](#estrutura-de-módulos)
  - [Arquitetura em Camadas](#arquitetura-em-camadas)
  - [Estrutura de Pastas](#estrutura-de-pastas)
  - [Validação e Tipagem](#validação-e-tipagem)
- [Decisões Técnicas](#decisões-técnicas)
  - [Funcionamento do Web Scraping](#funcionamento-do-web-scraping)
  - [Análise por Inteligência Artificial](#análise-por-inteligência-artificial)
- [Script de Ingestão de Dados](#script-de-ingestão-de-dados)
  - [Como Usar o Script](#como-usar-o-script)
  - [Demonstração em Vídeo](#demonstração-em-vídeo)
- [Como Iniciar o Projeto](#como-iniciar-o-projeto)
  - [Pré-requisitos](#pré-requisitos)
  - [Passo a Passo](#passo-a-passo)
- [Executando os Testes](#executando-os-testes)
  - [Opção 1: Script Automatizado (Recomendado)](#opção-1-script-automatizado-recomendado)
  - [Opção 2: Comandos Manuais via `package.json`](#opção-2-comandos-manuais-via-packagejson)
- [Endpoints da API](#endpoints-da-api)
- [Possíveis Melhorias](#possíveis-melhorias)

---

## Filosofia e Estrutura do Projeto

A principal decisão arquitetural foi organizar o código de forma modular e desacoplada, facilitando a manutenção e a adição de novas funcionalidades.

### Estrutura de Módulos

O projeto adota uma estrutura de **Feature-Sliced Design**. Dentro de `src/modules`, cada funcionalidade principal (`policies`, `scraping`, `ai`, `ingestion`) é um módulo autocontido. Cada módulo possui:

- `*.controller.ts`: Responsável por receber as requisições HTTP, validar os dados de entrada e retornar as respostas. Nenhuma regra de negócio reside aqui.
- `*.service.ts`: Contém a lógica de negócio da funcionalidade. Orquestra as operações e utiliza o repositório para acessar o banco de dados.
- `*.repository.ts`: Camada de abstração do acesso a dados. É o único local que interage diretamente com o Prisma para consultas ao banco de dados.
- `*.routes.ts`: Define as rotas da API para o módulo, associando-as aos métodos do controller.
- `*.schema.ts`: Define os schemas de validação com **Zod** para os dados de entrada (body, params, query) e para as respostas da API, garantindo a integridade dos dados e servindo como base para a documentação OpenAPI (Swagger).
- `*.types.ts`: Define as interfaces e tipos TypeScript para a funcionalidade.

### Arquitetura em Camadas

A comunicação entre os componentes segue um fluxo unidirecional claro (Controller → Service → Repository), o que torna o código previsível e fácil de depurar.

1. **Controller**: Camada de entrada da aplicação.
2. **Service**: O "cérebro" de cada funcionalidade.
3. **Repository**: A "mão" que busca e manipula os dados.

Essa separação de responsabilidades (SoC) é fundamental para a testabilidade e escalabilidade do projeto.

### Estrutura de Pastas

A organização das pastas segue a lógica modular descrita anteriormente, separando claramente as responsabilidades e facilitando a navegação.

```text
.
├── prisma/                  # Contém o schema do banco de dados e as migrações.
│   └── schema.prisma
├── scripts/                 # Scripts úteis para o projeto.
│   ├── run-ingestion-service.ts # Script para ingerir e analisar políticas de privacidade.
│   └── test-integration.sh  # Script para rodar os testes de integração de forma automatizada.
├── src/                     # Código-fonte da aplicação.
│   ├── core/                # Núcleo da aplicação (configurações não relacionadas a negócio).
│   │   ├── config/          # Configuração de variáveis de ambiente.
│   │   ├── database/        # Configuração da conexão com o banco de dados (Prisma).
│   │   └── webserver/       # Configurações do servidor Fastify (app, error handler).
│   ├── modules/             # Módulos de negócio da aplicação.
│   │   ├── ai/              # Módulo de Inteligência Artificial (Google Gemini).
│   │   ├── ingestion/       # Módulo de Ingestão (orquestração do processo).
│   │   ├── policies/        # Módulo de Políticas de Privacidade.
│   │   └── scraping/        # Módulo de Web Scraping.
│   ├── utils/               # Utilitários gerais da aplicação.
│   └── server.ts            # Ponto de entrada (entry point) que inicia o servidor.
├── tests/                   # Suíte de testes automatizados.
│   ├── helpers/             # Código de suporte para os testes (ex: setup do app).
│   └── integration/         # Testes de integração para cada módulo.
├── .dockerignore            # Arquivos a serem ignorados pelo Docker.
├── .env.example             # Arquivo de exemplo para as variáveis de ambiente.
├── docker-compose.test.yml  # Docker Compose para o ambiente de testes.
├── docker-compose.yml       # Docker Compose para o ambiente de desenvolvimento.
├── Dockerfile               # Define a imagem Docker para a aplicação.
├── package.json             # Dependências e scripts do projeto.
├── tsconfig.json            # Configurações do compilador TypeScript.
└── vitest.config.ts         # Configurações do Vitest.
```

### Validação e Tipagem

- **TypeScript**: Utilizado em todo o projeto para garantir a segurança de tipos e melhorar a experiência de desenvolvimento.
- **Zod**: Para validação de schemas em tempo de execução. Ele previne que dados inválidos cheguem às camadas de negócio e ao banco de dados, além de gerar documentação automática para as rotas.

---

## Decisões Técnicas

### Funcionamento do Web Scraping

O sistema de web scraping foi projetado com uma estratégia de fallback para garantir máxima compatibilidade com diferentes tipos de websites:

1. **Método Principal - Axios + Cheerio**: 
   - Primeira tentativa usando requisições HTTP simples com Axios
   - Parsing do HTML com Cheerio para extrair conteúdo
   - Mais rápido e eficiente em recursos
   - Funciona bem com sites que não dependem de JavaScript

2. **Método Fallback - Puppeteer**:
   - Utilizado quando o método principal falha
   - Renderiza páginas JavaScript com um navegador real (Chromium)
   - Mais lento mas compatível com SPAs e sites dinâmicos
   - Suporta sites que requerem interação do usuário

3. **Estratégias de Extração**:
   - Seletores específicos para sites conhecidos (Google, Facebook, etc.)
   - Algoritmo genérico baseado em densidade de texto para sites desconhecidos
   - Limpeza automática de conteúdo desnecessário (navegação, footers, etc.)

### Análise por Inteligência Artificial

A classificação de conteúdo utiliza o **Google Gemini 2.5 Flash Lite** com as seguintes características:

1. **Categorização Predefinida**:
   - 12 categorias específicas para políticas de privacidade
   - Inclui: Dados Pessoais, Dados Financeiros, Localização, Cookies, etc.

2. **Otimizações de Custo**:
   - Limitação do conteúdo enviado para análise (máximo 20.000 caracteres)
   - Uso da versão "lite" do modelo para reduzir custos

3. **Prompt Engineering**:
   - Prompt estruturado para garantir consistência nas respostas
   - Instruções específicas para retorno em formato JSON
   - Contexto sobre LGPD e regulamentações de privacidade brasileiras

---

## Script de Ingestão de Dados

O script de ingestão automatiza todo o processo de coleta, análise e armazenamento de políticas de privacidade.

### Como Usar o Script

1. **Configure as variáveis de ambiente**:
   ```bash
   # Adicione sua chave da API do Google Gemini no arquivo .env
   GOOGLE_AI_API_KEY=sua_chave_aqui
   ```

2. **Execute o script de ingestão**:
   ```bash
   npm run ingestion
   ```

3. **O script irá**:
   - Fazer scraping das URLs predefinidas
   - Analisar o conteúdo com IA
   - Classificar em categorias
   - Salvar no banco de dados

### URLs Predefinidas

O script vem configurado com as seguintes políticas de privacidade:
- Google Privacy Policy
- Facebook Privacy Policy  
- Microsoft Privacy Statement
- Apple Privacy Policy
- Amazon Privacy Notice

### Demonstração em Vídeo

**📹 [ESPAÇO RESERVADO PARA VÍDEO DEMONSTRATIVO]**

*Aqui será inserido um vídeo demonstrando:*
- *Execução do script de ingestão*
- *Processo de scraping em tempo real*
- *Classificação pela IA*
- *Resultados salvos no banco de dados*
- *Consulta dos dados via API*

**⚠️ Importante**: O script de scraping e análise por IA **não está disponível em produção** para evitar custos elevados com as APIs de inteligência artificial. Em ambiente de produção, os dados são previamente processados e inseridos manualmente no banco de dados.

---

## Como Iniciar o Projeto

Siga os passos abaixo para configurar e executar o ambiente de desenvolvimento localmente.

### Pré-requisitos

- **Node.js**: v22.18 ou superior
- **Docker** e **Docker Compose**
- **NPM** (ou um gerenciador de pacotes de sua preferência)
- **Chave API do Google Gemini** (para funcionalidades de IA)

### Passo a Passo

1. **Navegue até a pasta do projeto**:

   ```bash
   cd backend
   ```

2. **Instale as dependências**:

   ```bash
   npm install
   ```

3. **Configure as Variáveis de Ambiente**:
   Copie o arquivo de exemplo `.env.example` para um novo arquivo chamado `.env`.

   ```bash
   cp .env.example .env
   ```

   **Configure as seguintes variáveis importantes**:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/privacy_policies"
   GOOGLE_AI_API_KEY="sua_chave_do_google_gemini_aqui"
   ```

4. **Inicie os Containers**:
   Na raiz do repositório, execute o comando:

   ```bash
   docker-compose up -d
   ```

5. **Execute as Migrations do Banco de Dados**:
   Com os containers em execução, aplique as migrations para criar as tabelas.

   **OBS**: Esse passo só precisa ser feito na primeira execução do projeto ou quando há alguma alteração no schema.

   ```bash
   docker exec -it node_api npm run prisma:migrate
   ```

6. **Execute o script de ingestão inicial** (opcional):
   Para popular o banco com dados de exemplo:

   ```bash
   npm run ingestion
   ```

Pronto! A API estará em execução e acessível em `http://localhost:3333`.

---

## Executando os Testes

Os testes de integração foram desenvolvidos com **Vitest** e **Supertest** e rodam em um banco de dados de teste separado e isolado para garantir que não afetem os dados de desenvolvimento.

### Opção 1: Script Automatizado (Recomendado)

Para facilitar a execução dos testes, foi criado um script que cuida de todo o ciclo de vida do ambiente de teste.

- **O que o script faz?**
  1.  Sobe o banco de dados de teste com Docker.
  2.  Aplica as migrations no banco de teste.
  3.  Executa a suíte de testes do Vitest.
  4.  Derruba o container do banco de dados de teste ao final.

- **Como executar?**
  Na raiz da pasta `backend-nodejs`, execute o comando:
  ```bash
  sh ./scripts/test-integration.sh
  ```

### Opção 2: Comandos Manuais via `package.json`

Se preferir ter mais controle sobre o processo, você pode executar os testes manualmente.

1.  **Inicie o banco de dados de teste**:

    ```bash
    docker-compose -f docker-compose.test.yml up -d
    ```

2.  **Execute as migrations no banco de teste**:

    ```bash
    npm run test:db:migrate
    ```

3.  **Execute um dos seguintes comandos**:
    - Para rodar todos os testes uma vez:
      ```bash
      npm test
      ```
    - Para rodar os testes em modo "watch", ideal para desenvolvimento:
      ```bash
      npm run test:watch
      ```
    - Para rodar os testes e gerar um relatório de cobertura:
      ```bash
      npm run test:coverage
      ```

4.  **Desligue o banco de dados de teste** quando terminar:
    ```bash
    docker-compose -f docker-compose.test.yml down
    ```

---

## Endpoints da API

Abaixo está um resumo dos principais endpoints disponíveis. Para detalhes sobre os schemas de request e response, consulte a documentação OpenAPI/Swagger gerada pela aplicação. A documentação completa é executada na rota `/docs`.

| Método   | Rota                      | Descrição                                                    |
| :------- | :------------------------ | :----------------------------------------------------------- |
| `POST`   | `/api/policies`           | Cria uma nova política de privacidade.                      |
| `GET`    | `/api/policies`           | Lista todas as políticas de privacidade.                    |
| `GET`    | `/api/policies/:id`       | Busca uma política específica por ID.                       |
| `PUT`    | `/api/policies/:id`       | Atualiza uma política de privacidade existente.             |
| `DELETE` | `/api/policies/:id`       | Deleta uma política de privacidade.                         |

### Filtros e Paginação

A rota GET `/api/policies/` oferece os seguintes parâmetros:

- **`term`** (string, obrigatório): Termo de busca
- **`page`** (number, opcional): Página atual (padrão: 1)  
- **`page_size`** (number, opcional): Itens por página (padrão: 10, máximo: 50)

### Categorias Disponíveis

As políticas são classificadas automaticamente nas seguintes categorias:

- `DADOS PESSOAIS GERAIS`
- `DADOS FINANCEIROS` 
- `DADOS LOCALIZACAO`
- `COOKIES TRACKING`
- `MARKETING PUBLICIDADE`
- `COMPARTILHAMENTO TERCEIROS`
- `SEGURANCA PROTECAO`
- `DIREITOS USUARIO`
- `RETENCAO DADOS`
- `MENORES IDADE`
- `TRANSFERENCIA INTERNACIONAL`
- `OUTROS`

---

## Possíveis Melhorias

Esta seção documenta melhorias que poderiam ser implementadas para tornar o sistema mais robusto e escalável em um ambiente de produção:

### 1. Injeção de Dependências Melhorada
- **Problema atual**: Dependências são instanciadas diretamente nos construtores
- **Melhoria proposta**: Implementar um container de IoC (Inversão de Controle) como `tsyringe` ou `inversify`
- **Benefícios**: Melhor testabilidade, flexibilidade e desacoplamento

### 2. Download e Processamento de Arquivos PDF
- **Limitação atual**: Sistema processa apenas conteúdo HTML
- **Melhoria proposta**: Adicionar suporte para extração de texto de PDFs usando `pdf-parse` ou `pdf2pic`
- **Casos de uso**: Muitas políticas de privacidade são distribuídas como PDFs

### 3. Separação de Responsabilidades Refinada
- **Área de melhoria**: Módulo de scraping com múltiplas responsabilidades
- **Proposta**: Separar em `ScrapingStrategy`, `ContentExtractor`, e `URLValidator`
- **Padrão**: Implementar Strategy Pattern para diferentes tipos de extração

### 4. Monitoramento e Observabilidade
- **Ausente atualmente**: Métricas de performance e logging estruturado
- **Ferramentas sugeridas**: Prometheus + Grafana, Winston, OpenTelemetry
- **Métricas importantes**: Taxa de sucesso de scraping, tempo de resposta da IA, erros por endpoint

### 5. Testes de Carga e Performance
- **Gap atual**: Apenas testes de integração
- **Adição**: Testes com Artillery ou k6 para simular carga real
- **Cenários**: Múltiplas requisições simultâneas de scraping e classificação

---

## Links Relacionados

- **[ Projeto Principal](../)** - Raiz do repositório
- **[📖 Swagger Documentation](http://localhost:3333/docs)** - Documentação interativa da API
- **[🔗 API Base URL](http://localhost:3333)** - Endpoint base da API (desenvolvimento)
- **[⚙️ Configuração Docker](../docker-compose.yml)** - Setup completo com Docker
- **[🤖 Google Gemini API](https://ai.google.dev/)** - Documentação da API de IA utilizada
