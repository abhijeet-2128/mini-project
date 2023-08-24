// routes.ts
import { ServerRoute } from '@hapi/hapi';
import { CartController } from '../controller/cart.controller';
import dotenv from 'dotenv';
dotenv.config();

const api = process.env.API_URL;

const cartRoutes: ServerRoute[] = [
  {
    method: 'POST',
    path: api + '/cart/add',
    handler: CartController.addToCart,
    options: {
      auth: 'jwt', // Requires authentication
    },
  },
  {
    method: 'PUT',
    path: api + '/cart/update/{productId}',
    handler: CartController.updateCartItem,
    options: {
      auth: 'jwt', // Requires authentication
    },
  },
  {
    method: 'DELETE',
    path: api + '/cart/remove/{productId}',
    handler: CartController.removeCartItem,
    options: {
      auth: 'jwt', // Requires authentication
    },
  },
  {
    method: 'GET',
    path: api + '/cart',
    handler: CartController.getCart,
    options: {
      auth: 'jwt', // Requires authentication
    },
  },
];

export default cartRoutes;