import Hapi from '@hapi/hapi';
import Order, { OrderDoc, OrderStatus } from '../models/orders';
import { Product } from '../models/products';
import CartItem from '../models/cart';

interface PlaceOrderPayload {
  paymentMethod: string;
  shippingAddress: string;

}
export class OrderController {

  static checkout = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    try {
      const customerId = request.auth.credentials.customerId;
  
      const payload = request.payload as PlaceOrderPayload;
      const paymentMethod = payload.paymentMethod;
      const shippingAddress = payload.shippingAddress; 
      
      // Fetch cart items for the customer
      const cartItems = await CartItem.find({ customerId }).populate('productId'); //to retrieve product information

      // Create an array of ProductInOrder objects from the cart items
      const productsInOrder = cartItems.map((cartItem) => ({
        productId: cartItem.productId,
        quantity: cartItem.quantity,
      }));
  
      // Calculate total order amount
      let totalAmount = 0;
      cartItems.forEach((cartItem) => {
        totalAmount= totalAmount+ cartItem.price;
      });
  
      // Create a new order
      const newOrder = new Order({
        customerId,
        products: productsInOrder,
        totalAmount,
        paymentMethod,
        shippingAddress,
        created_at: new Date(),
        updated_at: new Date(),
      });
      
      const savedOrder = await newOrder.save();
  
      // Clear the cart
      await CartItem.deleteMany({ customerId });
  
      return h.response({
        message: 'Order placed successfully',
        customerId:savedOrder.customerId,
        products:savedOrder.products,  
        orderId: savedOrder._id,
        totalAmount: savedOrder.totalAmount,
        paymentMethod:savedOrder.paymentMethod,
        shippingAddress:savedOrder.shippingAddress,
      }).code(200);
    } catch (error) {
      console.error(error);
      return h.response({ message: 'Error placing order' }).code(500);
    }
  };


  static getOrder = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
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

  static getAllOrders = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    try {
      const customerId = request.auth.credentials.customerId;

      const orders = await Order.find({ customerId });
      return h.response(orders).code(200);
    } catch (error) {
      console.error(error);
      return h.response({ message: 'Error fetching orders' }).code(500);
    }
  };

  static updateOrderStatus = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    try {
      const { role } = request.auth.credentials; // Get the user's role from auth credentials

      if (role !== 'admin') {
        return h.response({ message: 'Unauthorized to add a product' }).code(403);
      }
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