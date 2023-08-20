// routes.ts
import { ServerRoute } from '@hapi/hapi';
import { addToCart, updateCartItem, removeCartItem, getCart } from '../controller/cart.controller';
import dotenv from 'dotenv';
dotenv.config();

const api = process.env.API_URL;

const cartRoutes: ServerRoute[] = [
  {
    method: 'POST',
    path: api + '/cart/add',
    handler: addToCart,
    options: {
      auth: 'jwt', // Requires authentication
    },
  },
  {
    method: 'PUT',
    path: api + '/cart/update/{productId}',
    handler: updateCartItem,
    options: {
      auth: 'jwt', // Requires authentication
    },
  },
  {
    method: 'DELETE',
    path: api + '/cart/remove/{productId}',
    handler: removeCartItem,
    options: {
      auth: 'jwt', // Requires authentication
    },
  },
  {
    method: 'GET',
    path: api + '/cart',
    handler: getCart,
    options: {
      auth: 'jwt', // Requires authentication
    },
  },
];

export default cartRoutes;