import { Product } from '../models/products';
import Cart from '../models/cart';

export class CartService {
  static async addToCart(customerId: string, productId: string, quantity: number = 1) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    let cart = await Cart.findOne({ customerId });

    const unit_price = product.price;
    const cartItem: any = {
      productId,
      quantity,
      unit_price,
    };

    if (cart) {
      const existingItem = cart.products.find(item => item.productId.toString() === productId);
      if (existingItem) {
        existingItem.quantity += quantity;
        cart.cartTotal += unit_price * quantity;
      } else {
        cart.products.push(cartItem);
        cart.cartTotal += unit_price * quantity;
      }
      await cart.save();
    } else {
      const cartTotal = quantity * unit_price;
      const newCart = new Cart({
        customerId,
        products: [cartItem],
        cartTotal,
      });
      await newCart.save();
    }
  }

  static async getCart(customerId: string) {
    const cart = await Cart.findOne({ customerId });
    if (!cart) {
      throw new Error('Cart not found');
    }

    return {
      products: cart.products,
      cartTotal: cart.cartTotal,
    };
  }

  static async updateCartItem(customerId: string, productId: string, quantity: number) {
    let cart = await Cart.findOne({ customerId });

    if (!cart) {
      throw new Error('Cart not found');
    }

    const existingItem = cart.products.find(item => item.productId.toString() === productId);

    if (existingItem) {
      const oldQuantity = existingItem.quantity;
      const unit_price = existingItem.unit_price;
      const priceDifference = unit_price * (quantity - oldQuantity);

      existingItem.quantity = quantity;
      cart.cartTotal += priceDifference;

      await cart.save();
    } else {
      throw new Error('Item not found in cart');
    }
  }

  static async removeCartItem(customerId: string, productId: string) {
    const cart = await Cart.findOne({ customerId });

    if (!cart) {
      throw new Error('Cart not found');
    }

    const existingItemIndex = cart.products.findIndex(item => item.productId.toString() === productId);
    if (existingItemIndex === -1) {
      throw new Error('Product not in cart');
    }

    const removedItem = cart.products.splice(existingItemIndex, 1)[0];
    cart.cartTotal -= removedItem.quantity * removedItem.unit_price;

    if (cart.products.length === 0) {
      await Cart.deleteOne({ _id: cart._id });
    } else {
      await cart.save();
    }
  }
}
