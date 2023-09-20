import { Customer } from '../models/customers';
import Order from '../models/orders';


export class OrderService {

  static async createOrder(customerId: string, orderItems: any, orderTotal: number, shippingAddress: any, paymentMethod: string) {

    const newOrder = new Order({
      customerId,
      items: orderItems,
      orderTotal,
      paymentMethod,
      shippingAddress,
    });
    const savedOrder = await newOrder.save();
    const customer = await Customer.findById(customerId);
    const customerEmail = customer?.email as string;
   await createEmailMessage(savedOrder, customerEmail);
   return savedOrder;
  }

}
 async function createEmailMessage(savedOrder: any, customer_email: string) {
  const emailMessage = {
    customerId: savedOrder.customerId,
    customer_email,
    orderId: savedOrder._id,
    products: savedOrder.items,
    totalAmount: savedOrder.orderTotal,
    paymentMethod: savedOrder.paymentMethod,
    shippingAddress: {
      street: savedOrder.shippingAddress.houseNo,
      city: savedOrder.shippingAddress.city,
      state: savedOrder.shippingAddress.district,
      country: savedOrder.shippingAddress.country,
    },
    orderStatus: savedOrder.status
  };
  const amqp = require('amqplib');

  const queueName = 'email-queue';
  const msg = JSON.stringify(emailMessage);
  const rabbitmqConnection = await amqp.connect(`amqp://localhost`);
  const channel = await rabbitmqConnection.createChannel();
  await channel.assertQueue(queueName, { durable: true });
  await channel.sendToQueue(queueName, Buffer.from(msg));
}


