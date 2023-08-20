import Hapi from '@hapi/hapi';
import Joi from 'joi';
import Order, { OrderStatus } from '../models/orders';
import { OrderController } from '../controller/orders.controller';
import dotenv from 'dotenv';
import { PaymentController } from '../controller/payment.controller';

dotenv.config();

const api = process.env.API_URL;
console.log(api);
 

const orderRoutes: Hapi.ServerRoute[] = [

  {
       method : 'POST',
       path : api+'/place-order',
       handler: OrderController.placeOrder,
       options: {
        auth: 'jwt', 
      },
  },

  {
    method: 'GET',
    path:api+ '/orders/{orderId}',
    handler:  OrderController.getOrder,
    options: {
      auth: 'jwt', // Requires authentication
    },
  },
  {
    method: 'GET',
    path: api+'/orders',
    handler:  OrderController.getAllOrders,
    options: {
      auth: 'jwt', // Requires authentication
    },
  },
  {
    method: 'PUT',
    path: api+'/orders/{orderId}/status',
    handler:  OrderController.updateOrderStatus,
    options: {
      auth: 'jwt', // Requires authentication
      validate: {
        payload: Joi.object({
          status: Joi.string().valid(...Object.values(OrderStatus)).required(),
        }),
      },
    },
  },


  //payment routes
  {
    method: 'POST',
    path: api + '/payment/checkout',
    handler:  PaymentController.checkout,
    options: {
      auth: 'jwt', // Requires authentication
    },
  },

];

export default orderRoutes;
