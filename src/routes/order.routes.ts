import Hapi from '@hapi/hapi';
import Joi from 'joi';
import Order, { OrderStatus } from '../models/orders';
import { OrderController } from '../controller/orders.controller';
import dotenv from 'dotenv';
import { adminAuthMiddleware } from '../middleware/admin.check';

dotenv.config();

const api = process.env.API_URL;
console.log(api);


const orderRoutes: Hapi.ServerRoute[] = [

  {
    method: 'POST',
    path: '/create-checkout-session',
    handler: OrderController.checkout,
    options: {
      auth: 'jwt',
    },
  },

  {
    method: 'GET',
    path: api + '/orders/{orderId}',
    handler: OrderController.getOrder,
    options: {
      auth: 'jwt',
    },
  },
  {
    method: 'GET',
    path: api + '/orders',
    handler: OrderController.getAllOrders,
    options: {
      auth: 'jwt',
    },
  },
  {
    method: 'PUT',
    path: api + '/orders/{orderId}/status',
    handler: OrderController.updateOrderStatus,
    options: {
      auth: 'jwt',
      pre: [{ method: adminAuthMiddleware }],
      validate: {
        payload: Joi.object({
          status: Joi.string().valid(...Object.values(OrderStatus)).required(),
        }),
      },
    },
  },

];

export default orderRoutes;
