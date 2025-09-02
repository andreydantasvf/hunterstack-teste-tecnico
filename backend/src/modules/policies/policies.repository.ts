import { PrismaClient } from '@prisma/client';
import { IPolicy, IPolicyRepository } from './policies.types';
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
