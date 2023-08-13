import Hapi from '@hapi/hapi';
import { Product, productJoiSchema } from '../models/products';
import dotenv from 'dotenv';
import jwt, { Secret } from 'jsonwebtoken';

dotenv.config();
const secretKey = process.env.SECRET_KEY ;

export const addProduct = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const token = request.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return h.response({ message: 'Missing authentication--- token' }).code(401);
    }
  
    try {
      const decodedToken = jwt.verify(token, secretKey as Secret) as { customerId: string, role: string };
      
      
      if (!decodedToken || !decodedToken.customerId) {
        return h.response({ message: 'Invalid authentication token' }).code(401);
      }
  
      // role check
      if (decodedToken.role !== 'admin') {
        return h.response({ message: 'Unauthorized to add a product' }).code(403);
      }
  
      const { error, value } = productJoiSchema.validate(request.payload);
  
      if (error) {
        return h.response({ message: 'Invalid payload', error }).code(400);
      }
  
      const { name, price, description, category, stock_quantity } = value;
  
      //images
        const images: string[] = [];
        // if (Array.isArray(request.payload['images'])) {
        //   for (const image of request.payload['images']) {
        //     if (typeof image === 'string') {
        //       images.push(image); // Assuming the image is a string representing the filename
        //       // Save image to storage and get the path
        //       // Example: const imagePath = await saveImageToStorage(image, image); // Adjust as needed
        //       // images.push(imagePath);
        //     }
        //   }
        // }
     
  
      
      const newProduct = new Product({ name, price, description, category, stock_quantity, images});
      await newProduct.save();
  
      return h.response({ message: 'Product added successfully' }).code(201);
    } catch (error: any) {
      console.log(error)
    }
  };
  

  export const getProduct = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    try {
      const productId = request.params.productId;
  
      // Find the product by ID
      const product = await Product.findById(productId);
      if (!product) {
        return h.response({ message: 'Product not found' }).code(404);
      }
  
      return h.response(product).code(200);
    } catch (error: any) {
      console.log(error);
      return h.response({ message: 'Error getting product' }).code(500);
    }
  };
  
  // Update a product by ID
export const updateProduct = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
  try {
    const productId = request.params.productId;
    const { error, value } = productJoiSchema.validate(request.payload);

    if (error) {
      return h.response({ message: 'Invalid payload', error }).code(400);
    }

    // Find the product by ID and update its fields
    const updatedProduct = await Product.findByIdAndUpdate(productId, value, { new: true });
    if (!updatedProduct) {
      return h.response({ message: 'Product not found' }).code(404);
    }

    return h.response({ message: 'Product updated successfully', product: updatedProduct }).code(200);
  } catch (error: any) {
    console.log(error);
    return h.response({ message: 'Error updating product' }).code(500);
  }
};

// Delete a product by ID
export const deleteProduct = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
  try {
    const productId = request.params.productId;

    // Find and delete the product by ID
    const deletedProduct = await Product.findByIdAndDelete(productId);
    if (!deletedProduct) {
      return h.response({ message: 'Product not found' }).code(404);
    }

    return h.response({ message: 'Product deleted successfully' }).code(200);
  } catch (error: any) {
    console.log(error);
    return h.response({ message: 'Error deleting product' }).code(500);
  }
};