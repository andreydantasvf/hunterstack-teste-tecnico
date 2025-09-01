import { errorHandler } from '@/core/webserver/error-handler';
import App from '@/core/webserver/app';
import { env } from '@/core/config/env';

export const app = new App({
  routes: []
});

errorHandler(app.getApp());

if (env.NODE_ENV !== 'test') {
  app.listen();
}
