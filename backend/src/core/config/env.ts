import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.string().default('development'),
  API_PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string().default(''),
  FRONTEND_URL: z.string().default('http://localhost:8080')
});

export const env = envSchema.parse(process.env);
