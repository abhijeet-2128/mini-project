import Hapi, { ServerRoute } from '@hapi/hapi';
import { connection } from './db/connection';
import { validateToken } from './middleware/validateToken';
import * as hapiAuthJwt2 from 'hapi-auth-jwt2';
import cartRoutes from './routes/cart.routes';
import userRoutes from './routes/user.routes';
import productRoutes from './routes/product.routes';
import categoryRoutes from './routes/categories.routes';
import ordersRoutes from './routes/order.routes';
import vision from "@hapi/vision";
import inert from "@hapi/inert";
import hapiswagger from 'hapi-swagger';
import path from 'path';
import eventRoutes from './routes/events.routes';


const secretKey = process.env.SECRET_KEY;
const init = async () => {
  const server = Hapi.server({
    port: 3001,
    host: 'localhost',
  });

  await connection();


  await server.register(hapiAuthJwt2);
  server.auth.strategy('jwt', 'jwt', {
    key: secretKey,
    validate: validateToken,
    verifyOptions: { algorithms: ['HS256'] },
  });

  await server.register({
    plugin: require('hapi-cron'),
    options: {
      jobs: [
        {
          name: 'sendEventMails',
          time: '0 0 * * * *', 
          timezone: 'Asia/Kolkata',
          request: {
            method: 'GET',
            url: '/sendEventMails',
          },
          onComplete: (res: any) => {
            console.log(res);
          },
        },
      ],
    },
  });

  await server.register([inert, vision,
    {
      plugin: hapiswagger,
      options: {
        info: {
          title: 'API Documentation',
          version: '1.0.0',
        },
        securityDefinitions: {
          jwt: {
            type: 'apiKey',
            name: 'Authorization',
            in: 'header',
          },
        },
        security: [{ jwt: [] }],
        grouping: 'tags',
        tags:
          [{ name: 'user', description: 'User endpoints' },
          { name: 'admin', description: 'Admin endpoints' },
          { name: 'vendor', description: 'Vendor endpoints' },
          ]
      }
    },]);

  const allRoutes: ServerRoute[] = [
    ...userRoutes,
    ...cartRoutes,
    ...productRoutes,
    ...categoryRoutes,
    ...ordersRoutes,
    ...eventRoutes
  ];

  server.route(allRoutes);

  await server.register(inert);
  server.route({
    method: 'GET',
    path: '/public/{param*}',
    handler: {
      directory: {
        path: path.join(__dirname, '..', 'public'),
        listing: false,
        index: true,
      }
    }
  });

  await server.start();
  console.log('Server running on %s', server.info.uri);
};
init();
