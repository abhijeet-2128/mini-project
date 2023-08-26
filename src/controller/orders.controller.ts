import { Request, ResponseToolkit } from '@hapi/hapi';
import Order, { OrderStatus } from '../models/orders';
import dotenv from 'dotenv';
import Cart from '../models/cart';
import { log } from 'console';

dotenv.config();

interface CheckoutPayload {
  paymentMethod: string;
  shippingAddress: {
    houseNo: string;
    city: string;
    district: string;
    country: string;
  };
}
const stripe = require('stripe')('sk_test_51Ng5VRSDGc9VTgGkVvLh6Nk4BYBN1fti7YYr9lZce0tbo5aQdtoP4GH3Q2SfIffgFkpDo2F5tYUtninF7ui6YQQG00Uc8BCNSz');
export class OrderController {

  //checkout cart
  // static checkout = async (request: Request, h: ResponseToolkit) => {
  //   try {
  //     const customerId = request.auth.credentials.customerId;
  //     const payload = request.payload as CheckoutPayload;

  //     const { paymentMethod, shippingAddress } = payload;

  //     let cart = await Cart.findOne({ customerId }).populate('products.productId');

  //     if (!cart) {
  //       return h.response({ message: 'Cart not found' }).code(404);
  //     }

  //     if (cart.products.length === 0) {
  //       return h.response({ message: 'Cart is empty' }).code(400);
  //     }

  //     // Validate paymentMethod
  //     if (paymentMethod !== 'cod' && paymentMethod !== 'card') {
  //       return h.response({ message: 'Invalid payment method' }).code(400);
  //     }

  //     if (paymentMethod === 'card') {
  //       // const cart = await Cart.findOne({ customerId }).populate('products.productId');
  //       if (!cart || cart.products.length === 0) {
  //         return h.response({ message: 'Cart is empty' }).code(400);
  //     }
  //       const session = await stripe.checkout.sessions.create({
  //         payment_method_types: ['card'],
  //         line_items: cart.products.map(item => ({
  //           price_data: {
  //             currency: 'usd',
  //             unit_amount: item.unit_price * 100, // Convert to cents
  //             product_data: {
  //               name: "E-store", 
  //             },
  //           },
  //           quantity: item.quantity,
  //         })),
  //         success_url: `${process.env.SERVER_URL}/success.html`,
  //         cancel_url: `${process.env.SERVER_URL}/cancel.html`,
  //       });
  //       const orderTotal = cart.cartTotal;

  //       const newOrder = new Order({
  //         customerId,
  //         items: orderItems,
  //         orderTotal,
  //         paymentMethod,
  //         shippingAddress,
  //       });
  //     const savedOrder = await newOrder.save();

  //     // Clear the cart
  //     await Cart.deleteMany({ customerId });

  //     return h.response({
  //         message: 'Order placed successfully',
  //         customerId: savedOrder.customerId,
  //         products: savedOrder.products,
  //         orderId: savedOrder._id,
  //         totalAmount: savedOrder.totalAmount,
  //         stripeCheckoutUrl: session.url, // Provide the Stripe Checkout URL to the client
  //     }).code(200);
  //       // You can now use the session.id to redirect the user to the Stripe Checkout
  //       return h.response({
  //         stripeSessionId: session.id, // Provide this session ID to the client
  //       }).code(200);
  //     }




  //     // Create an Order object based on the cart contents and user inputs
  //     const orderItems = cart.products.map(item => ({
  //       product: item.productId,
  //       quantity: item.quantity,
  //       unit_price: item.unit_price,
  //     }));

  //     const orderTotal = cart.cartTotal;

  //     const newOrder = new Order({
  //       customerId,
  //       items: orderItems,
  //       orderTotal,
  //       paymentMethod,
  //       shippingAddress,
  //     });

  //     // Save the new order
  //     await newOrder.save();

  //     // Clear the cart after placing the order
  //     await Cart.deleteOne({ _id: cart._id });

  //     return h.response({
  //       message: 'Order placed successfully',
  //       orderId: newOrder._id,
  //       customerId: newOrder.customerId,
  //       products: newOrder.items,
  //       orderTotal: newOrder.orderTotal,
  //       orderStatus: newOrder.status
  //     }).code(200);
  //   } catch (error) {
  //     console.error(error);
  //     return h.response({ message: 'Error placing order' }).code(500);
  //   }
  // };


  static checkout = async (request: Request, h: ResponseToolkit) => {
    try {
      const customerId = request.auth.credentials.customerId;
      const payload = request.payload as CheckoutPayload;
      const { paymentMethod, shippingAddress } = payload;

      let cart = await Cart.findOne({ customerId }).populate('products.productId');

      if (!cart) {
        return h.response({ message: 'Cart not found' }).code(404);
      }

      if (cart.products.length === 0) {
        return h.response({ message: 'Cart is empty' }).code(400);
      }

      // Validate paymentMethod
      if (paymentMethod !== 'cod' && paymentMethod !== 'card') {
        return h.response({ message: 'Invalid payment method' }).code(400);
      }

      if (paymentMethod === 'card') {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          mode: 'payment',
          line_items: cart.products.map(item => ({
            price_data: {
              currency: 'usd',
              unit_amount: item.unit_price * 100,
              product_data: {
                name: "Items",
                description: "Please pay for your order"
              },
            },
            quantity: item.quantity,
          })),
          success_url: 'http://127.0.0.1:5500/public/success.html',
          cancel_url: `${process.env.SERVER_URL}/public/.html`,
        });
        console.log("hello" + process.env.SERVER_URL);

        await Cart.deleteOne({ _id: cart._id });

        return h.response({
          stripeCheckoutUrl: session.url,
        }).code(200);
      }

      const orderItems = cart.products.map(item => ({
        product: item.productId,
        quantity: item.quantity,
        unit_price: item.unit_price,
      }));

      const orderTotal = cart.cartTotal;

      const newOrder = new Order({
        customerId,
        items: orderItems,
        orderTotal,
        paymentMethod,
        shippingAddress,
      });

      const savedOrder = await newOrder.save();

      await Cart.deleteOne({ _id: cart._id });

      return h.response({
        message: 'Order placed successfully',
        customerId: savedOrder.customerId,
        products: savedOrder.items,
        orderId: savedOrder._id,
        totalAmount: savedOrder.orderTotal,
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
      console.log(orders);
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
}