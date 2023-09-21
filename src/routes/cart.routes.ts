import { ServerRoute } from '@hapi/hapi';
import { CartController } from '../controller/cart.controller';
import dotenv from 'dotenv';
import Joi from 'joi';
import { checkUserStatus } from '../middleware/auth.check';
dotenv.config();

const api = process.env.API_URL;

const cartRoutes: ServerRoute[] = [
  {
    method: 'POST',
    path: api + '/cart/add',
    handler: CartController.addToCart,
    options: {
      auth: 'jwt',
      pre:[{method:checkUserStatus}],
      tags: ['api', 'cart'],
      description: 'Add to cart',
      validate: {
        payload: Joi.object({
          productId: Joi.string().required(),
          quantity: Joi.number().integer().min(1).required(),
        }),
      },
    }
  },
  {
    method: 'PUT',
    path: api + '/cart/update/{productId}',
    handler: CartController.updateCartItem,
    options: {
      auth: 'jwt',
      tags: ['api', 'cart'],
      description: 'Update cart',
      validate: {
        params: Joi.object({
          productId: Joi.string().required(),
        }),
        payload: Joi.object({
          quantity: Joi.number().integer().min(1).required(),
        }),
      },
    }
  },
  {
    method: 'DELETE',
    path: api + '/cart/remove/{productId}',
    handler: CartController.removeCartItem,
    options: {
      auth: 'jwt',
      tags: ['api', 'cart'],
      description: 'Remove cart',
      validate: {
        params: Joi.object({
          productId: Joi.string().required(),
        }),
      },
    }
  },
  {
    method: 'GET',
    path: api + '/cart',
    handler: CartController.getCart,
    options: {
      auth: 'jwt',
      tags: ['api', 'cart'],
      description: 'Get cart',
    }
  },
];

export default cartRoutes;