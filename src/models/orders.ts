import mongoose, { Schema, Document } from 'mongoose';

export enum OrderStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Shipped = 'shipped',
  Delivered = 'delivered',
  Cancelled = 'cancelled',
}

export interface ProductInOrder {
  productId: string;
  quantity: number;
}

export interface OrderDoc extends Document {
  customerId: string;
  products: ProductInOrder[];
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: string;
  paymentMethod: string;
  createdAt : Date;
}

const orderSchema = new Schema({
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  products: [
    {
      productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
    },
  ],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: Object.values(OrderStatus), default: OrderStatus.Pending },
  shippingAddress: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  createdAt : Date,
});

const Order = mongoose.model<OrderDoc>('Order', orderSchema);

export default Order;
