import { PrismaClient } from '@prisma/client';
import {
  IPolicy,
  IPolicyRepository,
  IPolicySearchParams,
  IPolicySearchResult
} from './policies.types';
import { DatabaseConnection } from '@/core/database/connection';
import { AppError } from '@/core/webserver/app-error';

export class PoliciesRepository implements IPolicyRepository {
  private db: PrismaClient;

  constructor() {
    this.db = DatabaseConnection.getInstance().getClient();
  }

  async save({ title, content, source_url, category }: IPolicy) {
    try {
      const policy = await this.db.policy.create({
        data: {
          title,
          content,
          source_url,
          category
        }
      });
      return policy;
    } catch (error) {
      throw new AppError('Erro ao salvar política: ' + error, 500);
    }
  }

  async findAll(): Promise<IPolicy[]> {
    try {
      const policies = await this.db.policy.findMany();
      return policies;
    } catch (error) {
      throw new AppError('Erro ao buscar políticas: ' + error, 500);
    }
  }

  async search(params: IPolicySearchParams): Promise<IPolicySearchResult> {
    try {
      const { term, page = 1, page_size = 10 } = params;
      const skip = (page - 1) * page_size;

      const where = term
        ? {
            OR: [
              { title: { contains: term, mode: 'insensitive' as const } },
              { content: { contains: term, mode: 'insensitive' as const } },
              { category: { contains: term, mode: 'insensitive' as const } }
            ]
          }
        : {};

      const [policies, total] = await Promise.all([
        this.db.policy.findMany({
          where,
          skip,
          take: page_size,
          orderBy: { createdAt: 'desc' }
        }),
        this.db.policy.count({ where })
      ]);

      const total_pages = Math.ceil(total / page_size);

      return {
        policies,
        total,
        page,
        page_size,
        total_pages
      };
    } catch (error) {
      throw new AppError('Erro ao buscar políticas: ' + error, 500);
    }
  }

  async findById(id: string): Promise<IPolicy | null> {
    try {
      const policy = await this.db.policy.findUnique({
        where: { id }
      });
      return policy;
    } catch (error) {
      throw new AppError('Erro ao buscar política: ' + error, 500);
    }
  }

  async update(id: string, policy: Partial<IPolicy>): Promise<IPolicy | null> {
    try {
      const updatedPolicy = await this.db.policy.update({
        where: { id },
        data: policy
      });
      return updatedPolicy;
    } catch (error) {
      throw new AppError('Erro ao atualizar política: ' + error, 500);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.db.policy.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      throw new AppError('Erro ao deletar política: ' + error, 500);
    }
  }
}
