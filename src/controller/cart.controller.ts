import Hapi from '@hapi/hapi';
import CartItem  from '../models/cart'; 
import { Product } from '../models/products';

interface AddToCartPayload {
  productId: string; 
  quantity?: number; 
}

// Add an item to the cart
export const addToCart = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
  try {
    const customerId = request.auth.credentials.customerId; // Extract customer ID from authenticated token

    const payload = request.payload as AddToCartPayload;
    const productId = payload.productId; 
    const quantity = payload.quantity || 1; // Default to 1 if quantity is not provided

    const product = await Product.findById(productId);
    if (!product) {
      return h.response({ message: 'Product not found' }).code(404);
    }

    const price = product.price * quantity; // Calculate total price based on quantity

    // Check if the item with the same productId already exists in the cart
    const existingCartItem = await CartItem.findOne({ customerId, productId });

    if (existingCartItem) {
      // If the item exists, update its quantity and price
      await CartItem.findByIdAndUpdate(existingCartItem._id, {
        quantity: existingCartItem.quantity + quantity,
        price: existingCartItem.price + price,
      });
      return h.response({ message: 'Quantity updated in cart' }).code(200);
    }

    // If the item doesn't exist, create a new cart item
    const newCartItem = new CartItem({
      customerId,
      productId,
      quantity,
      price,
    });
    await newCartItem.save();

    return h.response({ message: 'Item added to cart successfully' }).code(200);
  } catch (error) {
    console.error(error);
    return h.response({ message: 'Error adding item to cart' }).code(500);
  }
}; 



// Update an item in the cart
export const updateCartItem = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
  try {
    const customerId = request.auth.credentials.customerId;
    const productId = request.params.productId;

    const payload = request.payload as AddToCartPayload;
    const newQuantity = payload.quantity || 1; // Default to 1 if quantity is not provided

    const product = await Product.findById(productId);
    if (!product) {
      return h.response({ message: 'Product not found' }).code(404);
    }

    const newPrice = product.price * newQuantity; // Calculate new total price

    // Update the cart item's quantity and price
    await CartItem.findOneAndUpdate(
      { customerId, productId },
      { quantity: newQuantity, price: newPrice },
    );

    return h.response({ message: 'Cart item updated successfully' }).code(200);
  } catch (error) {
    console.error(error);
    return h.response({ message: 'Error updating cart item' }).code(500);
  }
};


// Remove an item from the cart
export const removeCartItem = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
  try {
    const customerId = request.auth.credentials.customerId;
    const productId = request.params.productId;

    // Remove the cart item
    const deletedItem = await CartItem.findOneAndDelete({ customerId, productId });

    if (!deletedItem) {
      return h.response({ message: 'Cart item not found' }).code(404);
    }

    return h.response({ message: 'Cart item removed successfully' }).code(200);
  } catch (error) {
    console.error(error);
    return h.response({ message: 'Error removing cart item' }).code(500);
  }
};


// Get the cart items for a customer
export const getCart = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
  try {
    const customerId = request.auth.credentials.customerId;

    // Find all cart items for the customer
    const cartItems = await CartItem.find({ customerId }).populate('productId');
  console.log(cartItems);
  
    return h.response(cartItems).code(200);
  } catch (error) {
    console.error(error);
    return h.response({ message: 'Error fetching cart items' }).code(500);
  }
};
