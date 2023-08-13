// routes.ts
import { ServerRoute } from '@hapi/hapi';
import { addToCart, updateCartItem, removeCartItem, getCart } from '../controller/cart.controller';

const api = process.env.API_URL;

const cartRoutes: ServerRoute[] = [
  {
    method: 'POST',
    path: api + '/cart/add',
    handler: addToCart,
    options: {
      auth: 'jwt', // Require authentication to add products to the cart
    },
  },
  {
    method: 'PUT',
    path: api + '/cart/update/{productId}',
    handler: updateCartItem,
    options: {
      auth: 'jwt', // Require authentication to update cart items
    },
  },
  {
    method: 'DELETE',
    path: api + '/cart/remove/{productId}',
    handler: removeCartItem,
    options: {
      auth: 'jwt', // Require authentication to remove cart items
    },
  },
  {
    method: 'GET',
    path: api + '/cart',
    handler: getCart,
    options: {
      auth: 'jwt', // Require authentication to retrieve the cart
    },
  },
];

export default cartRoutes;
