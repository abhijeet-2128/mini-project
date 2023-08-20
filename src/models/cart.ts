import mongoose, { Document, Schema } from 'mongoose';

export interface CartItemDoc extends Document {
  customerId: Schema.Types.ObjectId;
  productId: Schema.Types.ObjectId;
  quantity: number;
  price: number;
}

const cartItemSchema = new mongoose.Schema<CartItemDoc>({
  customerId: { type: Schema.Types.ObjectId, required: true, ref: 'Customer' },
  productId: { type: Schema.Types.ObjectId, required: true, ref: 'Product' },
  quantity: { type: Number, required: true, default: 1 },
  price: { type: Number, required: true }, // Define the price field
});

const CartItem = mongoose.model<CartItemDoc>('CartItem', cartItemSchema);

export default CartItem;
