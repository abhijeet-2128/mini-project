import Hapi from '@hapi/hapi';
import stripe from 'stripe';
import dotenv from 'dotenv';
import Order from '../models/orders';
dotenv.config();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY! ;

// Create a Stripe instance using the secret key
const stripeClient = new stripe.Stripe(stripeSecretKey, {
  apiVersion: '2023-08-16', 
});

export class PaymentController{

  static checkout = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    try {
      const {orderId} : any= request.payload;
  
        // Fetch order details from the database
        const order = await Order.findById(orderId).populate('products.productId');
        // console.log(order);
        
        if (!order) {
          return h.response({ message: 'Order not found' }).code(404);
        }
  
      
        const totalPrice = order.totalAmount * 100;
    
      const paymentIntent = await stripeClient.paymentIntents.create({
        amount: totalPrice,
        currency: 'usd',
        payment_method_types: ['card'],
      });
      
      console.log(paymentIntent);
      
      // Return the payment intent ID 
      return h.response({ paymentIntentId: paymentIntent.id, }).code(200);
    } catch (error) {
      console.error(error);
      return h.response({ message: 'Error during checkout' }).code(500);
    }
  };
}