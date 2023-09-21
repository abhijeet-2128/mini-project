import Hapi from '@hapi/hapi';
import Joi, { options } from 'joi';
import { OrderStatus } from '../models/orders';
import { OrderController } from '../controller/orders.controller';
import dotenv from 'dotenv';
import { adminAuthMiddleware } from '../middleware/auth.check';

dotenv.config();

const api = process.env.API_URL;

const orderRoutes: Hapi.ServerRoute[] = [

  {
    method: 'POST',
    path: api + '/checkout',
    handler: OrderController.checkout,
    options: {
      auth: 'jwt',
      tags: ['api', 'user'],
      description: 'checkout cart',
      validate: {
        payload: Joi.object({
          paymentMethod: Joi.string().valid('cod', 'card').required(),
          shippingAddress: Joi.object({
            houseNo: Joi.string().required(),
            city: Joi.string().required(),
            district: Joi.string().required(),
            country: Joi.string().required(),
          }).required(),
        }),
      },
    }
  },

  {
    method: 'GET',
    path: api + '/orders/{orderId}',
    handler: OrderController.getOrder,
    options: {
      auth: 'jwt',
      tags: ['api', 'user'],
      description: 'Get order by id',
      validate: {
        params: Joi.object({
          orderId: Joi.string().required(),
        }),
      },
    }
  },
  {
    method: 'GET',
    path: api + '/orders',
    handler: OrderController.getAllOrders,
    options: {
      auth: 'jwt',
      tags: ['api', 'user'],
      description: 'get all orders',
    }
  },
  {
    method: 'PUT',
    path: api + '/orders/{orderId}/status',
    handler: OrderController.updateOrderStatus,
    options: {
      auth: 'jwt',
      tags: ['api', 'admin'],
      description: 'update order status',
      pre: [{ method: adminAuthMiddleware }],
      validate: {
        params: Joi.object({
          orderId: Joi.string().required(),
        }),
        payload: Joi.object({
          status: Joi.string().valid(...Object.values(OrderStatus)).required(),
        }),
      },
    },
  },

  {
    method: 'POST',
    path: api + '/orders/cancel/{orderId}',
    handler: OrderController.cancelOrder,
    options: {
      auth: 'jwt',
      tags: ['api', 'user'],
      description: 'get all orders',
      validate: {
        params: Joi.object({
          orderId: Joi.string().required(),
        }),
      }
    },
  },

  //card order
  {
    method: 'POST',
    path: '/stripe-webhook',
    handler: OrderController.paymentSuccessHandler,
  }

];

export default orderRoutes;
