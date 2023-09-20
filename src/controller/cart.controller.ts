import { Request, ResponseToolkit } from '@hapi/hapi';
import { CartService } from '../services/cart.services';

interface AddToCartPayload {
  productId: string;
  quantity?: number;
}

export class CartController {
  static async addToCart(request: Request, h: ResponseToolkit) {
    try {
      const customerId = request.auth.credentials.customerId as string;
      const payload = request.payload as AddToCartPayload;
      const productId = payload.productId;
      const quantity = payload.quantity || 1;

      await CartService.addToCart(customerId, productId, quantity);

      return h.response({ message: 'Item added to cart successfully' }).code(200);
    } catch (error) {
      console.error(error);
      return h.response({ message: 'Error adding item to cart' }).code(500);
    }
  }

  static async getCart(request: Request, h: ResponseToolkit) {
    try {
      const customerId = request.auth.credentials.customerId as string;
      console.log(customerId);
      
      const customerCart = await CartService.getCart(customerId);

      console.log(customerCart);
      
      if (!customerCart) {
        return h.response({ message: customerCart }).code(404);
      }
      return h.response(customerCart).code(200);
    } catch (error:any) {
      return h.response(error.message).code(500);
    }
  }

  static async updateCartItem(request: Request, h: ResponseToolkit) {
    try {
      const customerId = request.auth.credentials.customerId as string;
      const productId = request.params.productId;

      const payload = request.payload as AddToCartPayload;
      const newQuantity = payload.quantity || 1;

      await CartService.updateCartItem(customerId, productId, newQuantity);

      return h.response({ message: 'Cart item updated successfully' }).code(200);
    } catch (error) {
      console.error(error);
      return h.response({ message: 'Error updating cart item' }).code(500);
    }
  }

  static async removeCartItem(request: Request, h: ResponseToolkit) {
    try {
      const customerId = request.auth.credentials.customerId as string;
      const productId = request.params.productId;

      await CartService.removeCartItem(customerId, productId);

      return h.response({ message: 'Item removed from cart successfully' }).code(200);
    } catch (error) {
      console.error(error);
      return h.response({ message: 'Error removing item from cart' }).code(500);
    }
  }
}
