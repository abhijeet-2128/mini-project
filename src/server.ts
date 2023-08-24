import Hapi, { ServerRoute } from '@hapi/hapi';
import { connection } from './db/connection';
import { validateToken } from './middleware/validateToken';
import * as hapiAuthJwt2 from 'hapi-auth-jwt2';
import cartRoutes from './routes/cart.routes';
import userRoutes from './routes/user.routes';
import productRoutes from './routes/product.routes';
import categoryRoutes from './routes/categories.routes';
import ordersRoutes from './routes/order.routes';
import { ViewRoutes } from './routes/views.routes';
import vision from "@hapi/vision";
import inert from "@hapi/inert";
import path from 'path';

const init = async () => {
  const server = Hapi.server({
    port: 3001,
    host: 'localhost',
  });
  const secretKey = process.env.SECRET_KEY;


  await connection();


  await server.register(hapiAuthJwt2);
  server.auth.strategy('jwt', 'jwt', {
    key: secretKey,
    validate: validateToken,
    verifyOptions: { algorithms: ['HS256'] },
  });

  await server.register([vision, inert]);


  server.views({
    engines: {
      ejs: require('ejs')
    },
    relativeTo: path.join(__dirname, '..'),
    path: 'my-ecom-temp'
  });

  server.route({
    method: 'GET',
    path: '/static/{param*}',
    handler: {
      directory: {
        path: path.join(__dirname, '..', 'my-ecom-temp'),

      }
    }
  });


  const allRoutes: ServerRoute[] = [
    ...userRoutes,
    ...ViewRoutes,
    ...cartRoutes,
    ...productRoutes,
    ...categoryRoutes,
    ...ordersRoutes,
  ];
  server.route(allRoutes);

  await server.start();

  console.log('Server running on %s', server.info.uri);
};

init();
