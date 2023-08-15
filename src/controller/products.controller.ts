import Hapi from '@hapi/hapi';
import { Product, productJoiSchema } from '../models/products';
import dotenv from 'dotenv';
import jwt, { Secret } from 'jsonwebtoken';

dotenv.config();
const secretKey = process.env.SECRET_KEY ;

export const addProduct = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const token = request.headers.authorization?.replace('Bearer ', '');
  
    try {
      const decodedToken = jwt.verify(token, secretKey as Secret) as { customerId: string, role: string };
      
      
      if (!decodedToken || !decodedToken.customerId) {
        return h.response({ message: 'Invalid authentication token' }).code(401);
      }
  
      //role check
      if (decodedToken.role !== 'admin') {
        return h.response({ message: 'Unauthorized to add a product' }).code(403);
      }
  
      const { error, value } = productJoiSchema.validate(request.payload);
  
      if (error) {
        return h.response({ message: 'Invalid payload', error }).code(400);
      }
  
      const { name, price, description, category, stock_quantity,images } = value;
  
  
      const newProduct = new Product({ name, price, description, category, stock_quantity, images});
      await newProduct.save();
  
      return h.response({ message: 'Product added successfully' }).code(201);
    } catch (error: any) {
      console.log(error);
    }
  };

  //get all products 
  export const getAllProducts = async(request:Hapi.Request, h:Hapi.ResponseToolkit)=>{
    try{
      const product = await Product.find();
      return h.response(product).code(200);
    }catch(error){
     console.log(error);
     
    }
  }

  //filter products 
 // products.controller.ts

// ... other imports and code ...

export const filterByCategory = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
  try {
    const category = request.query.category;
    const sortBy = request.query.sortBy; // 'priceLowToHigh' or undefined for default

    if (!category) {
      return h.response({ message: 'Category parameter is missing' }).code(400);
    }

    let filteredProducts = await Product.find({ category });

    if (sortBy === 'priceLowToHigh') {
      filteredProducts = filteredProducts.sort((a, b) => a.price - b.price);
    }

    return h.response(filteredProducts).code(200);
  } catch (error: any) {
    console.log(error);
    return h.response({ message: 'Error filtering products by category' }).code(500);
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