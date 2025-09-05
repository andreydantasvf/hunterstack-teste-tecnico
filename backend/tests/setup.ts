import { beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '../generated/prisma';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5433/test_db';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

beforeAll(async () => {
  try {
    await prisma.$connect();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Erro ao conectar no banco de teste:', error);
    throw error;
  }
});

beforeEach(async () => {
  await prisma.policy.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

export { prisma };
