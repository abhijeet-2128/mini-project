import { Product } from '../models/products';
import Cart from '../models/cart';
import mongoose from 'mongoose';

export class CartService {

  static async checkCartExist(payload: any) {
    return await Cart.findOne(payload);
  }

  static async stockManagement(payload: any) {
    await Promise.all(payload.map(async (item: any) => {
      const product = await Product.findById(item.product);
      if (!product) {
        return 'Product not found'
      }
      if (product.stock_quantity < item.quantity) {
        return 'Insufficient stock for the product'
      }
      product.stock_quantity -= item.quantity;
      await product.save();
    }));
  }

  static async deleteCart(payload: any) {
    return await Cart.deleteOne(payload);
  }


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

  //get user cart 
  static async getCart(customerId: string) {
    console.log(customerId+"serviee");
    
    // const customerid=new mongoose.Types.ObjectId(customerId)
    const cart = await Cart.findOne({customerId:customerId});
    
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
