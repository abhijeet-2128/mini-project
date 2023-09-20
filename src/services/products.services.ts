import {Product} from '../models/products';

interface ProductData {
    name: string;
    price: number;
    description: string;
    category: string;
    stock_quantity: number;
    images: string[];
  }

 export class ProductService {
    static async addProduct(productData:ProductData, customerId:string) {
      try {
        const existingProduct = await Product.findOne({ name: productData.name });
        if (existingProduct) {
          throw new Error('Product with the same name already exists');
        }
  
        const newProduct = new Product({
          name: productData.name,
          price: productData.price,
          description: productData.description,
          category: productData.category,
          stock_quantity: productData.stock_quantity,
          images: productData.images,
          vendor_id: customerId,
        });
  
        await newProduct.save();
  
        return { message: 'Product added successfully' };
      } catch (error) {
        console.error(error);
        throw new Error('An error occurred while adding the product');
      }
    }
  }
  



