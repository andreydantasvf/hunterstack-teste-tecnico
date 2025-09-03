import { errorHandler } from '@/core/webserver/error-handler';
import App from '@/core/webserver/app';
import { env } from '@/core/config/env';
import { PoliciesRoutes } from './modules/policies/policies.routes';

export const app = new App({
  routes: [PoliciesRoutes]
});

errorHandler(app.getApp());

if (env.NODE_ENV !== 'test') {
  app.listen();
}
