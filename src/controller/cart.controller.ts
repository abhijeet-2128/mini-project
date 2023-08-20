import Hapi from '@hapi/hapi';
import Cart from '../models/cart';
import { Product } from '../models/products';
import { Customer } from '../models/customers';

export const addToCart = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
  try {
    const customerId = request.auth.credentials.customerId; // Extract customer ID from authenticated token
console.log(customerId);

    const { productId} :any = request.payload;
    console.log(productId);
    
    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return h.response({ message: 'Product not found' }).code(404);
    }

    // Find or create the cart for the customer
    let cart = await Cart.findOne({ customer: customerId });
    if (!cart) {
      cart = new Cart({ customer: customerId, products: [] });
    }

    //if the product is already in the cart
    // const existingProduct = cart.products.find((cartProduct: CartProduct) => cartProduct.product.equals(productId));

    // if (existingProduct) {
    //   existingProduct.quantity += 1;
    // } else {
    //   cart.products.push({ product: productId, quantity: 1 });
    // }

    await cart.save();

    return h.response({ message: 'Product added to cart successfully' }).code(201);
  } catch (error) {
    return h.response({ message: 'Error adding product to cart', error }).code(500);
  }
};

export const updateCartItem = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
  try {
    const customerId = request.auth.credentials.customerId; // Extract customer ID from authenticated token

    const productId = request.params.productId;
    // const newQuantity = request.payload.quantity;

    // Find the customer's cart
    const cart = await Cart.findOne({ customer: customerId });

    if (!cart) {
      return h.response({ message: 'Cart not found' }).code(404);
    }

    // find the cart item to update
    // const cartItem = cart.products.find((cartProduct: CartProduct) => cartProduct.product.equals(productId));

    // if (!cartItem) {
    //   return h.response({ message: 'Product not found in cart' }).code(404);
    // }

    // cartItem.quantity = newQuantity;
    await cart.save();

    return h.response({ message: 'Cart item updated successfully' }).code(200);
  } catch (error) {
    return h.response({ message: 'Error updating cart item', error }).code(500);
  }
};

export const removeCartItem = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
  try {
    const customerId = request.auth.credentials.customerId; // Extract customer ID from authenticated token

    const productId = request.params.productId;

    // find the customer's cart
    const cart = await Cart.findOne({ customer: customerId });

    if (!cart) {
      return h.response({ message: 'Cart not found' }).code(404);
    }

    // find the cart item to remove
    // const cartItemIndex = cart.products.findIndex((cartProduct: CartProduct) => cartProduct.product.equals(productId));

    // if (cartItemIndex === -1) {
    //   return h.response({ message: 'Product not found in cart' }).code(404);
    // }

    // cart.products.splice(cartItemIndex, 1);
    await cart.save();

    return h.response({ message: 'Cart item removed successfully' }).code(200);
  } catch (error) {
    return h.response({ message: 'Error removing cart item', error }).code(500);
  }
};

export const getCart = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
  try {
    const customerId = request.auth.credentials.customerId; // Extract customer ID from authenticated token

    // find the customer's cart and populate the products details
    const cart = await Cart.findOne({ customer: customerId }).populate({
      path: 'products.product',
      select: ['name', 'price'],
    });

    if (!cart) {
      return h.response({ message: 'Cart not found' }).code(404);
    }

    return h.response({ cart }).code(200);
  } catch (error) {
    return h.response({ message: 'Error retrieving cart', error }).code(500);
  }
};
