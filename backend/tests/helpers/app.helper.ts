import { FastifyInstance } from 'fastify';
import App from '@/core/webserver/app';
import { PoliciesRoutes } from '@/modules/policies/policies.routes';

export async function createTestApp(): Promise<FastifyInstance> {
  const appInstance = new App({
    routes: [PoliciesRoutes]
  });

  const app = appInstance.getApp();
  await app.ready();

  return app;
}

export async function closeTestApp(app: FastifyInstance): Promise<void> {
  await app.close();
}
