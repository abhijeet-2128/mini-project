import { Request, ResponseToolkit } from '@hapi/hapi';
import Order, { OrderStatus } from '../models/orders';
import dotenv from 'dotenv';
import Cart from '../models/cart';
import { Customer } from '../models/customers';
import { Product } from '../models/products';
import { customer_service } from '../services/users.services';
import { CartService } from '../services/cart.services';
import { OrderService } from '../services/orders.services';
import { createStripe } from '../utils/stripe.con';

dotenv.config();
// const amqp = require('amqplib');
const stripe = require('stripe')('sk_test_51Ng5VRSDGc9VTgGkVvLh6Nk4BYBN1fti7YYr9lZce0tbo5aQdtoP4GH3Q2SfIffgFkpDo2F5tYUtninF7ui6YQQG00Uc8BCNSz');

interface CheckoutPayload {
  paymentMethod: string;
  shippingAddress: {
    houseNo: string;
    city: string;
    district: string;
    country: string;
  };
}

export class OrderController {

  // static checkout = async (request: Request, h: ResponseToolkit) => {
  //   try {
  //     const customerId = request.auth.credentials.customerId;
  //     const payload = request.payload as CheckoutPayload;

  //     const { paymentMethod, shippingAddress } = payload;
  //     const customer = await Customer.findById(customerId);
  //     const customerEmail = customer?.email;
  //     if (!customerEmail) {
  //       return h.response({ message: 'Customer email not found' }).code(400);
  //     }
  //     //finding the user cart
  //     let cart = await Cart.findOne({ customerId }).populate('products.productId');
  //     if (!cart) {
  //       return h.response({ message: 'Cart not found' }).code(404);
  //     }
  //     if (cart.products.length === 0) {
  //       return h.response({ message: 'Cart is empty' }).code(400);
  //     }

  //     //fetching the cart items
  //     const orderItems = cart.products.map(item => ({
  //       product: item.productId,
  //       quantity: item.quantity,
  //       unit_price: item.unit_price,
  //     }));

  //     await Promise.all(orderItems.map(async (item) => {
  //       const product = await Product.findById(item.product);
  //       if (!product) {
  //         return h.response({ message: 'Product not found' }).code(404);
  //       }
  //       if (product.stock_quantity < item.quantity) {
  //         return h.response({ message: 'Insufficient stock for the product' }).code(400);
  //       }
  //       product.stock_quantity -= item.quantity;
  //       await product.save();
  //     }));

  //     // Validate paymentMethod
  //     if (paymentMethod !== 'cod' && paymentMethod !== 'card') {
  //       return h.response({ message: 'Invalid payment method' }).code(400);
  //     }
  //     const orderTotal = cart.cartTotal;
  //     const newOrder = new Order({
  //       customerId,
  //       items: orderItems,
  //       orderTotal,
  //       paymentMethod,
  //       shippingAddress,
  //     });
  //     const savedOrder = await newOrder.save();

  //     const emailMessage = {
  //       customerId: savedOrder.customerId,
  //       customerEmail,
  //       orderId: savedOrder._id,
  //       products: savedOrder.items,
  //       totalAmount: savedOrder.orderTotal,
  //       paymentMethod: savedOrder.paymentMethod,
  //       shippingAddress: {
  //         street: savedOrder.shippingAddress.houseNo,
  //         city: savedOrder.shippingAddress.city,
  //         state: savedOrder.shippingAddress.district,
  //         country: savedOrder.shippingAddress.country,
  //       },
  //       orderStatus: savedOrder.status
  //     };

  //     //rabbitmq 
  //     const queueName = 'email-queue';
  //     const msg = JSON.stringify(emailMessage);
  //     const rabbitmqConnection = await amqp.connect(`amqp://localhost`);
  //     const channel = await rabbitmqConnection.createChannel();
  //     await channel.assertQueue(queueName, { durable: true });
  //     await channel.sendToQueue(queueName, Buffer.from(msg));

  //     if (paymentMethod === 'card') {
  //       const session = await stripe.checkout.sessions.create({
  //         line_items: cart.products.map(item => ({
  //           price_data: {
  //             currency: 'inr',
  //             unit_amount: item.unit_price * 100,
  //             product_data: {
  //               name: "Items",
  //               description: "Please pay for your order",
  //             },
  //           },
  //           quantity: item.quantity,
  //         })),
  //         mode: 'payment',
  //         payment_intent_data: {
  //           setup_future_usage: 'on_session',
  //         },
  //         customer_email: customerEmail,
  //         success_url: `${process.env.SERVER_URL}/public/success.html?orderId=${savedOrder._id}`,
  //         cancel_url: `${process.env.SERVER_URL}/public/cancel.html`,
  //       });
  //       console.log(session);
  //       return h.response({
  //         message: 'Please pay through this link',
  //         stripeCheckoutUrl: session.url,
  //       }).code(200);

  //     } else if (paymentMethod === 'cod') {

  //       await Cart.deleteOne({ _id: cart._id });
  //       return h.response({
  //         message: 'Order placed successfully',
  //         customerId: savedOrder.customerId,
  //         products: savedOrder.items,
  //         orderId: savedOrder._id,
  //         totalAmount: savedOrder.orderTotal,
  //         paymentMethod: savedOrder.paymentMethod,
  //         orderStatus: savedOrder.status
  //       }).code(200);
  //     } else {
  //       return h.response({ message: 'Invalid payment method' }).code(400);
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     return h.response({ message: 'Error placing order' }).code(500);
  //   }
  // }

  static checkout = async (request: Request, h: ResponseToolkit) => {
    try {
      const customerId = request.auth.credentials.customerId as string;
      const payload = request.payload as CheckoutPayload;
      const { paymentMethod, shippingAddress } = payload;

      const customer = await customer_service.checkUserExists({ _id: customerId });
      if (!customer) {
        return h.response({ message: 'Customer not found' }).code(404);
      }
      const cart = await CartService.checkCartExist({ customerId: customerId });
      if (!cart) {
        return h.response({ message: 'Cart does not exist' }).code(404);
      }

      const orderTotal = cart.cartTotal;

      if (cart.products.length === 0) {
        return h.response({ message: 'Cart is empty' }).code(400);
      }

      const orderItems = cart.products.map(item => ({
        product: item.productId,
        quantity: item.quantity,
        unit_price: item.unit_price,
      }));
      await CartService.stockManagement(orderItems);

      //Validate paymentMethod
      if (paymentMethod !== 'cod' && paymentMethod !== 'card') {
        return h.response({ message: 'Invalid payment method' }).code(400);
      }
      const savedOrder = await OrderService.createOrder(customerId, orderItems, orderTotal, shippingAddress, paymentMethod);
      console.log(savedOrder);

      if (paymentMethod === 'card') {
        const link = await createStripe(cart, customer.email, savedOrder);
        console.log(link);
      } else if (paymentMethod === 'cod') {
        await CartService.deleteCart({ _id: cart._id });
      } else {
        return h.response({ message: 'Invalid payment method' }).code(400);
      }

      return h.response({
        message: 'Order placed successfully',
        customerId: savedOrder.customerId,
        products: savedOrder.items,
        orderId: savedOrder._id,
        totalAmount: savedOrder.orderTotal,
        paymentMethod: savedOrder.paymentMethod,
        orderStatus: savedOrder.status
      }).code(200);
    } catch (error) {
      console.error(error);
      return h.response({ message: 'Error placing order' }).code(500);
    }
  }



  //get order by id
  static getOrder = async (request: Request, h: ResponseToolkit) => {
    try {
      const customerId = request.auth.credentials.customerId;
      const orderId = request.params.orderId;

      const order = await Order.findOne({ _id: orderId, customerId }).populate('items.product');
      console.log(order);

      if (!order) {
        return h.response({ message: 'Order not found' }).code(404);
      }

      const formattedOrder = {
        orderId: order._id,
        orderItems: order.items,
        orderTotal: order.orderTotal,
        order_status: order.status,
        ordered: order.createdAt
      };

      return h.response(formattedOrder).code(200);
    } catch (error) {
      console.error(error);
      return h.response({ message: 'Error fetching order' }).code(500);
    }
  };


  //get all orders
  static getAllOrders = async (request: Request, h: ResponseToolkit) => {
    try {
      const customerId = request.auth.credentials.customerId;

      const orders = await Order.find({ customerId }).populate('items.product').sort({ createdAt: -1 });

      const formattedOrders: any = orders.map(order => ({
        orderId: order._id,
        orderTotal: order.orderTotal,
        order_status: order.status,
        ordered: order.createdAt,
      }));

      return h.response(formattedOrders).code(200);
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

  static cancelOrder = async (request: Request, h: ResponseToolkit) => {
    try {
      const customerId = request.auth.credentials.customerId;
      const orderId = request.params.orderId;

      const order = await Order.findOne({ _id: orderId, customerId });

      if (!order) {
        return h.response({ message: 'Order not found' }).code(404);
      }

      if (order.status === OrderStatus.Cancelled) {
        return h.response({ message: 'Order is already canceled' }).code(400);
      }

      // restore product stock quantities
      await Promise.all(order.items.map(async (item) => {
        const product = await Product.findById(item.product);

        if (product) {
          product.stock_quantity += item.quantity;
          await product.save();
        }
      }));

      // Update the order status to cancel
      order.status = OrderStatus.Cancelled;
      await order.save();

      return h.response({ message: 'Order canceled successfully' }).code(200);
    } catch (error) {
      console.error(error);
      return h.response({ message: 'Error canceling order' }).code(500);
    }
  };

  //webhook events 
  static async paymentSuccessHandler(request: any, h: any) {
    try {
      const event = request.payload;

      console.log('Received Stripe webhook event:', event);

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const orderId = extractOrderIdFromSuccessUrl(session.success_url);
        const updatedOrder = await Order.findByIdAndUpdate(orderId, { paymentStatus: 'Paid' }, { new: true });

        if (!updatedOrder) {
          const errorMessage = 'Order not found or could not be updated';
          console.error(errorMessage);
          return h.response({ message: errorMessage }).code(404);
        }
        const transactionId = session.payment_intent;
        const paymentTimestamp = new Date(session.created * 1000); // Convert Stripe timestamp to JavaScript Date

        // Update the order with transaction details
        updatedOrder.transactionId = transactionId;
        updatedOrder.paymentTimestamp = paymentTimestamp;
        updatedOrder.status = OrderStatus.Confirmed;
        await updatedOrder.save();
        const deletedCart = await Cart.findOneAndRemove({ customerId: updatedOrder.customerId });
        if (!deletedCart) {
          const errorMessage = 'Cart not found or could not be deleted';
          console.error(errorMessage);
          return h.response({ message: errorMessage }).code(404);
        }
        console.log('Order status updated and cart deleted successfully');
        return h.response({ message: 'Order status updated and cart deleted successfully' }).code(200);
      } else {
        console.log('Received a different type of Stripe webhook event:', event.type);
        return h.response().code(200);
      }
    } catch (error) {
      console.error('Error processing Stripe webhook:', error);
      return h.response().code(500);
    }
    function extractOrderIdFromSuccessUrl(successUrl: string) {
      const url = new URL(successUrl);
      const orderIdParam = url.searchParams.get('orderId');
      return orderIdParam;
    }
  }
}