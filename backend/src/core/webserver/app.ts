import fastify, { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fastifySwagger from '@fastify/swagger';
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler
} from 'fastify-type-provider-zod';
import fastifyApiReference from '@scalar/fastify-api-reference';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { env } from '@/core/config/env';

interface CustomRouteHandler {
  prefix_route: string;
  routes: FastifyPluginAsync;
}

class App {
  private app: FastifyInstance;
  private app_domain: string = '0.0.0.0';
  private app_port: number = env.API_PORT || 3333;

  constructor(appInit: { routes: (new () => CustomRouteHandler)[] }) {
    this.app = fastify({
      logger: true
    });

    this.app.register(cors, {
      origin: env.FRONTEND_URL,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      exposedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
      maxAge: 86400
    });

    this.app.register(helmet, {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: []
        }
      }
    });

    this.app.setValidatorCompiler(validatorCompiler);
    this.app.setSerializerCompiler(serializerCompiler);

    this.app.register(fastifySwagger, {
      openapi: {
        info: {
          title: 'HunterStack.io Backend - Teste Técnico',
          description:
            'Documentação completa do backend do teste técnico da HunterStack.io .',
          version: '1.0.0',
          contact: {
            name: 'Suporte API',
            email: 'andreydantasvf@gmail.com'
          },
          license: {
            name: 'MIT',
            url: 'https://opensource.org/licenses/MIT'
          }
        },
        servers: [
          {
            url: `http://localhost:${this.app_port}`,
            description: 'Servidor de desenvolvimento'
          }
        ],
        tags: [
          {
            name: 'Policies',
            description:
              'Operações relacionadas ao gerenciamento de políticas de privacidade'
          }
        ]
      },
      transform: jsonSchemaTransform
    });

    this.app.addHook('preHandler', (req, _reply, done) => {
      if (req.body) {
        req.log.info({ body: req.body }, 'parsed body');
      }
      done();
    });

    this.app.register(fastifyApiReference, {
      routePrefix: '/docs',
      configuration: {
        theme: 'kepler',
        spec: {
          url: '/documentation/json'
        },
        metaData: {
          title: 'HunterStack.io Backend - Teste Técnico',
          description: 'Documentação interativa da API',
          ogDescription:
            'Documentação completa da API para gerenciamento de políticas de privacidade'
        }
      }
    });

    this.routes(appInit.routes);
  }

  private routes(routes: (new () => CustomRouteHandler)[]) {
    routes.forEach((Route) => {
      const router = new Route();
      this.app.register(router.routes, {
        prefix: `/api${router.prefix_route}`
      });
    });

    this.app.get('/healthcheck', async (_request, reply) => {
      reply.send({ healthcheck: 'server is alive' });
    });

    this.app.get('/documentation/json', async (_request, _reply) => {
      return this.app.swagger();
    });
  }

  public getApp(): FastifyInstance {
    return this.app;
  }

  public getDomain(): string {
    return this.app_domain;
  }

  public getPort(): number {
    return this.app_port;
  }

  public listen() {
    this.app.listen({ host: this.app_domain, port: this.app_port }, (err) => {
      if (err) {
        this.app.log.fatal({ msg: `Application startup error`, err });
        process.exit(1);
      }

      if (env.NODE_ENV !== 'test') {
        // eslint-disable-next-line no-console
        console.log(
          `App listening on the http://${this.app_domain}:${this.app_port} 🚀`
        );
      }
    });
  }

  public async close() {
    if (this.app) {
      await this.app.close();
    }
  }
}

export default App;
