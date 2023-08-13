// main server file
import Hapi, { ServerRoute } from '@hapi/hapi';

import { connection } from './db/connection';
import authRoutes from './routes/routes';
import { validateToken } from './middleware/validateToken';
import * as hapiAuthJwt2 from 'hapi-auth-jwt2';
import { log } from 'console';
import cartRoutes from './routes/cart.routes';
// Import other route files if you have more routes

const init = async () => {
  const server = Hapi.server({
    port: 3001,
    host: 'localhost',
  });
const secretKey = process.env.SECRET_KEY;
console.log(secretKey);

// Connect database
  await connection();


 //auth strategy
 await server.register(hapiAuthJwt2);
 server.auth.strategy('jwt', 'jwt', {
  key: secretKey, // Your secret key used for JWT
  validate: validateToken, // Your token validation function
  verifyOptions: { algorithms: ['HS256'] }, // Algorithm used for JWT
});

server.auth.default('jwt');
// await server.register(require('hapi-payload-raw'));


  // Register routes
server.route(authRoutes as ServerRoute[]);
server.route(cartRoutes);

  // Start the server
  await server.start();

  console.log('Server running on %s', server.info.uri);
};

// Rest of the code remains unchanged
init();
