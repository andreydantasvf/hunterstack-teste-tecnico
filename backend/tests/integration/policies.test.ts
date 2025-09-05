import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import request from 'supertest';
import { createTestApp, closeTestApp } from '../helpers/app.helper';
import { prisma } from '../setup';

interface PolicyResponse {
  id: string;
  title: string;
  source_url: string;
  content: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

describe('Policies Endpoints Integration Tests', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  describe('GET /api/policies', () => {
    it('deve retornar array vazio quando não há políticas', async () => {
      const response = await request(app.server)
        .get('/api/policies')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: []
      });
    });

    it('deve retornar todas as políticas cadastradas', async () => {
      await prisma.policy.createMany({
        data: [
          {
            title: 'Política de Privacidade Google',
            source_url: 'https://policies.google.com/privacy',
            content: 'Conteúdo da política do Google...',
            category: 'Tech'
          },
          {
            title: 'Política de Privacidade Facebook',
            source_url: 'https://www.facebook.com/privacy',
            content: 'Conteúdo da política do Facebook...',
            category: 'Social Media'
          },
          {
            title: 'Política de Privacidade Amazon',
            source_url: 'https://www.amazon.com/privacy',
            content: 'Conteúdo da política da Amazon...',
            category: 'E-commerce'
          }
        ]
      });

      const response = await request(app.server)
        .get('/api/policies')
        .expect(200);

      expect(response.body.data).toHaveLength(3);
      const policyTitles = response.body.data.map(
        (p: PolicyResponse) => p.title
      );
      expect(policyTitles).toContain('Política de Privacidade Google');
      expect(policyTitles).toContain('Política de Privacidade Facebook');
      expect(policyTitles).toContain('Política de Privacidade Amazon');
    });

    it('deve retornar políticas com estrutura correta', async () => {
      await prisma.policy.create({
        data: {
          title: 'Política de Teste',
          source_url: 'https://exemplo.com/privacy',
          content: 'Conteúdo de teste...',
          category: 'Teste'
        }
      });

      const response = await request(app.server)
        .get('/api/policies')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data[0]).toHaveProperty('id');
      expect(response.body.data[0]).toHaveProperty('title');
      expect(response.body.data[0]).toHaveProperty('source_url');
      expect(response.body.data[0]).toHaveProperty('content');
      expect(response.body.data[0]).toHaveProperty('category');
      expect(response.body.data[0]).toHaveProperty('createdAt');
      expect(response.body.data[0]).toHaveProperty('updatedAt');
    });
  });

  describe('GET /api/policies/:id', () => {
    it('deve retornar política existente por ID', async () => {
      const policy = await prisma.policy.create({
        data: {
          title: 'Política de Teste Individual',
          source_url: 'https://test.com/privacy',
          content: 'Conteúdo da política de teste...',
          category: 'Test'
        }
      });

      const response = await request(app.server)
        .get(`/api/policies/${policy.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.id).toBe(policy.id);
      expect(response.body.data.title).toBe('Política de Teste Individual');
      expect(response.body.data.source_url).toBe('https://test.com/privacy');
      expect(response.body.data.content).toBe(
        'Conteúdo da política de teste...'
      );
      expect(response.body.data.category).toBe('Test');
    });

    it('deve retornar 400 para ID inválido (não UUID)', async () => {
      await request(app.server).get('/api/policies/invalid-id').expect(400);
    });
  });

  describe('POST /api/policies', () => {
    it('deve criar nova política com sucesso', async () => {
      const newPolicy = {
        title: 'Nova Política de Teste',
        source_url: 'https://nova.com/privacy',
        content: 'Conteúdo da nova política...',
        category: 'Nova'
      };

      const response = await request(app.server)
        .post('/api/policies')
        .send(newPolicy)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.title).toBe('Nova Política de Teste');
      expect(response.body.data.source_url).toBe('https://nova.com/privacy');
      expect(response.body.data.content).toBe('Conteúdo da nova política...');
      expect(response.body.data.category).toBe('Nova');
      expect(response.body.data.id).toBeDefined();

      const savedPolicy = await prisma.policy.findUnique({
        where: { id: response.body.data.id }
      });
      expect(savedPolicy).toBeTruthy();
      expect(savedPolicy?.title).toBe('Nova Política de Teste');
    });

    it('deve rejeitar título vazio', async () => {
      await request(app.server)
        .post('/api/policies')
        .send({
          title: '',
          source_url: 'https://exemplo.com/privacy',
          content: 'Conteúdo...',
          category: 'Tech'
        })
        .expect(400);
    });

    it('deve rejeitar URL inválida', async () => {
      await request(app.server)
        .post('/api/policies')
        .send({
          title: 'Política Teste',
          source_url: 'url-inválida',
          content: 'Conteúdo...',
          category: 'Tech'
        })
        .expect(400);
    });

    it('deve rejeitar conteúdo vazio', async () => {
      await request(app.server)
        .post('/api/policies')
        .send({
          title: 'Política Teste',
          source_url: 'https://exemplo.com/privacy',
          content: '',
          category: 'Tech'
        })
        .expect(400);
    });

    it('deve rejeitar categoria vazia', async () => {
      await request(app.server)
        .post('/api/policies')
        .send({
          title: 'Política Teste',
          source_url: 'https://exemplo.com/privacy',
          content: 'Conteúdo...',
          category: ''
        })
        .expect(400);
    });

    it('deve rejeitar URL duplicada', async () => {
      // Criar uma política primeiro
      await prisma.policy.create({
        data: {
          title: 'Política Original',
          source_url: 'https://unique.com/privacy',
          content: 'Conteúdo original...',
          category: 'Original'
        }
      });

      // Tentar criar outra com a mesma URL
      await request(app.server)
        .post('/api/policies')
        .send({
          title: 'Política Duplicada',
          source_url: 'https://unique.com/privacy',
          content: 'Conteúdo duplicado...',
          category: 'Duplicado'
        })
        .expect(500); // Erro de violação de constraint única
    });
  });

  describe('PUT /api/policies/:id', () => {
    it('deve atualizar política existente', async () => {
      const policy = await prisma.policy.create({
        data: {
          title: 'Título Original',
          source_url: 'https://original.com/privacy',
          content: 'Conteúdo original...',
          category: 'Original'
        }
      });

      const updateData = {
        title: 'Título Atualizado',
        source_url: 'https://atualizado.com/privacy',
        content: 'Conteúdo atualizado...',
        category: 'Atualizado'
      };

      const response = await request(app.server)
        .put(`/api/policies/${policy.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.title).toBe('Título Atualizado');
      expect(response.body.data.source_url).toBe(
        'https://atualizado.com/privacy'
      );
      expect(response.body.data.content).toBe('Conteúdo atualizado...');
      expect(response.body.data.category).toBe('Atualizado');
    });

    it('deve retornar 404 para ID inexistente na atualização', async () => {
      const fakeUuid = '550e8400-e29b-41d4-a716-446655440000';
      await request(app.server)
        .put(`/api/policies/${fakeUuid}`)
        .send({
          title: 'Título Teste',
          source_url: 'https://teste.com/privacy',
          content: 'Conteúdo...',
          category: 'Teste'
        })
        .expect(404);
    });
  });

  describe('DELETE /api/policies/:id', () => {
    it('deve deletar política existente', async () => {
      const policy = await prisma.policy.create({
        data: {
          title: 'Política para Deletar',
          source_url: 'https://deletar.com/privacy',
          content: 'Conteúdo para deletar...',
          category: 'Deletar'
        }
      });

      const response = await request(app.server)
        .delete(`/api/policies/${policy.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toBeNull();

      const deletedPolicy = await prisma.policy.findUnique({
        where: { id: policy.id }
      });
      expect(deletedPolicy).toBeNull();
    });

    it('deve retornar 404 para ID inexistente na deleção', async () => {
      const fakeUuid = '550e8400-e29b-41d4-a716-446655440000';
      await request(app.server).delete(`/api/policies/${fakeUuid}`).expect(404);
    });

    it('deve retornar 400 para ID inválido na deleção', async () => {
      await request(app.server).delete('/api/policies/invalid-id').expect(400);
    });
  });

  describe('GET /api/policies com busca e paginação', () => {
    beforeEach(async () => {
      await prisma.policy.createMany({
        data: [
          {
            title: 'Política Google Privacy',
            source_url: 'https://google.com/privacy',
            content:
              'Como o Google coleta e utiliza dados pessoais dos usuários.',
            category: 'Tech'
          },
          {
            title: 'Política Facebook Data',
            source_url: 'https://facebook.com/data',
            content: 'Informações sobre coleta de dados no Facebook.',
            category: 'Social Media'
          },
          {
            title: 'Política Amazon Shopping',
            source_url: 'https://amazon.com/shopping',
            content: 'Como a Amazon protege dados de compras dos clientes.',
            category: 'E-commerce'
          }
        ]
      });
    });

    it('deve buscar políticas por termo no título', async () => {
      const response = await request(app.server)
        .get('/api/policies?term=Google')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toContain('Google');
      expect(response.body).toHaveProperty('pagination');
    });

    it('deve buscar políticas por termo no conteúdo', async () => {
      const response = await request(app.server)
        .get('/api/policies?term=dados')
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body).toHaveProperty('pagination');
    });

    it('deve implementar paginação', async () => {
      const response = await request(app.server)
        .get('/api/policies?page=1&page_size=2&term=')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.page_size).toBe(2);
      expect(response.body.pagination.total).toBe(3);
      expect(response.body.pagination.total_pages).toBe(2);
    });

    it('deve retornar array vazio para termo que não corresponde', async () => {
      const response = await request(app.server)
        .get('/api/policies?term=inexistente')
        .expect(200);

      expect(response.body.data).toHaveLength(0);
      expect(response.body.pagination.total).toBe(0);
    });
  });

  describe('GET /api/policies/:id/download', () => {
    it('deve fazer download da política em formato JSON', async () => {
      const policy = await prisma.policy.create({
        data: {
          title: 'Política para Download',
          source_url: 'https://download.com/privacy',
          content: 'Conteúdo para download...',
          category: 'Download'
        }
      });

      const response = await request(app.server)
        .get(`/api/policies/${policy.id}/download?format=json`)
        .expect(200);

      expect(response.headers['content-type']).toContain('application/json');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.body.title).toBe('Política para Download');
    });

    it('deve rejeitar formato não suportado', async () => {
      const policy = await prisma.policy.create({
        data: {
          title: 'Política Teste',
          source_url: 'https://teste.com/privacy',
          content: 'Conteúdo...',
          category: 'Teste'
        }
      });

      await request(app.server)
        .get(`/api/policies/${policy.id}/download?format=pdf`)
        .expect(400);
    });
  });
});
