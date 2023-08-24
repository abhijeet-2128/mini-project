import { Request, ResponseToolkit } from '@hapi/hapi';
import Stripe from 'stripe'; // Import Stripe library

import Order, { OrderDoc, OrderStatus } from '../models/orders';
import CartItem from '../models/cart';
import dotenv from 'dotenv';

dotenv.config();
interface PlaceOrderPayload {
  paymentMethod: string;
  shippingAddress: string;
}


// Create a Stripe instance using the secret key
const stripe = require('stripe')('sk_test_51Ng5VRSDGc9VTgGkVvLh6Nk4BYBN1fti7YYr9lZce0tbo5aQdtoP4GH3Q2SfIffgFkpDo2F5tYUtninF7ui6YQQG00Uc8BCNSz');


export class OrderController {

 // Replace with your actual Stripe secret key
 

  static checkout = async (request: Request, h: ResponseToolkit) => {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
          {
            // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
            price: '{{PRICE_ID}}',
            quantity: 1,
          },
        ],
        success_url: `${process.env.SERVER_URL}/success.html`,
        cancel_url: `${process.env.SERVER_URL}/cancel.html`,
      })
      return h.redirect(session.url);
    } catch (e) {
      console.error('Error creating checkout session:');
      return h.response('An error occurred').code(500);

    }
  };


  // static checkout = async (request: Request, h: ResponseToolkit) => {
  //   try {
  //     const customerId = request.auth.credentials.customerId;
  
  //     const payload = request.payload as PlaceOrderPayload;
  //     const paymentMethod = payload.paymentMethod;
  //     const shippingAddress = payload.shippingAddress;
  
  //     // Fetch cart items for the customer
  //     const cartItems = await CartItem.find({ customerId }).populate('productId');
  
  //     // Create an array of ProductInOrder objects from the cart items
  //     const productsInOrder = cartItems.map((cartItem) => ({
  //       productId: cartItem.productId,
  //       quantity: cartItem.quantity,
  //     }));
  
  //     // Calculate total order amount
  //     let totalAmount = 0;
  //     cartItems.forEach((cartItem) => {
  //       totalAmount= totalAmount+ cartItem.price;
  //     });
  
  //     // Create a new order
  //     const newOrder = new Order({
  //       customerId,
  //       products: productsInOrder,
  //       totalAmount,
  //       paymentMethod,
  //       shippingAddress,
  //     });
  //     const savedOrder = await newOrder.save();
  
  //     // Clear the cart
  //     await CartItem.deleteMany({ customerId });
  
  //     return h.response({
  //       message: 'Order placed successfully',
  //       customerId:savedOrder.customerId,
  //       products:savedOrder.products,  
  //       orderId: savedOrder._id,
  //       totalAmount: savedOrder.totalAmount,
  //     }).code(200);
  //   } catch (error) {
  //     console.error(error);
  //     return h.response({ message: 'Error placing order' }).code(500);
  //   }
  // };
  


  static getOrder = async (request: Request, h: ResponseToolkit) => {
    try {
      const orderId = request.params.orderId;
      const customerId = request.auth.credentials.customerId;

      const order = await Order.findOne({ _id: orderId, customerId });
      if (!order) {
        return h.response({ message: 'Order not found' }).code(404);
      }

      return h.response(order).code(200);
    } catch (error) {
      console.error(error);
      return h.response({ message: 'Error fetching order' }).code(500);
    }
  };

  static getAllOrders = async (request: Request, h: ResponseToolkit) => {
    try {
      const customerId = request.auth.credentials.customerId;

      const orders = await Order.find({ customerId });
      return h.response(orders).code(200);
    } catch (error) {
      console.error(error);
      return h.response({ message: 'Error fetching orders' }).code(500);
    }
  };

  static updateOrderStatus = async (request: Request, h: ResponseToolkit) => {
    try {
    
      const orderId = request.params.orderId;
      const { status } = request.payload as { status: OrderStatus };

      const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
      if (!order) {
        return h.response({ message: 'Order not found' }).code(404);
      }

      return h.response({ message: 'Order status updated successfully' }).code(200);
    } catch (error) {
      console.error(error);
      return h.response({ message: 'Error updating order status' }).code(500);
    }
  };
}