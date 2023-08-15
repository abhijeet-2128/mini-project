import Hapi, { ServerRoute } from '@hapi/hapi';
import { connection } from './db/connection';
import { validateToken } from './middleware/validateToken';
import * as hapiAuthJwt2 from 'hapi-auth-jwt2';
import cartRoutes from './routes/cart.routes';
import userRoutes from './routes/user.routes';
import productRoutes from './routes/product.routes';
import categoryRoutes from './routes/ categories.routes';

const init = async () => {
  const server = Hapi.server({
    port: 3001,
    host: 'localhost',
  });
  const secretKey = process.env.SECRET_KEY;

  // Connect database
  await connection();

  //auth strategy
  await server.register(hapiAuthJwt2);
  server.auth.strategy('jwt', 'jwt', {
    key: secretKey, //  secret key used for JWT
    validate: validateToken, // token validation function
    verifyOptions: { algorithms: ['HS256'] }, // Algorithm used for JWT
  });

  server.auth.default('jwt');
  // await server.register(require('hapi-payload-raw'));

  // Register routes
  server.route(userRoutes as ServerRoute[]);
  server.route(cartRoutes);
  server.route(productRoutes);
  server.route(categoryRoutes);

  // Start the server
  await server.start();

  console.log('Server running on %s', server.info.uri);
};

init();
