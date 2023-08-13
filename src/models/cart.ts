// cart.ts
import mongoose, { Document } from 'mongoose';

export interface CartProduct extends Document {
  product: mongoose.Schema.Types.ObjectId;
  quantity: number;
}

export interface CartDoc extends Document {
  customer: mongoose.Schema.Types.ObjectId;
  products: CartProduct[];
  created_at: Date;
  updated_at: Date;
}

const cartSchema = new mongoose.Schema<CartDoc>({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
    },
  ],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const Cart = mongoose.model<CartDoc>('cart', cartSchema);

export default Cart;
