import mongoose, { Schema, Document } from 'mongoose';
import Joi from 'joi';

export interface ProductDoc extends mongoose.Document {
  name: string;
  price: number;
  description?: string;
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }, // Reference to Category model
  stock_quantity: number;
  images: string[];
  attributes: {
    color?: string;
    size?: string;
  };
  created_at: Date;
  updated_at: Date;
}

const productSchema = new mongoose.Schema<ProductDoc>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  category: { type: String, required: true },
  stock_quantity: { type: Number, required: true },
  images: [{ type: String }],
  attributes: {
    color: { type: String },
    size: { type: String },
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

productSchema.pre<ProductDoc>('save', function (next) {
  this.updated_at = new Date();
  next();
});

const Product = mongoose.model<ProductDoc>('Product', productSchema);


  const productJoiSchema = Joi.object<ProductDoc>({
    name: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().min(0).required(),
    category: Joi.string().required(),
    stock_quantity: Joi.number().integer().min(0).required(),
    images: Joi.array().items(Joi.string()),    
    // attributes: Joi.object({
    //   color: Joi.string(),
    //   size: Joi.string(),
    //   // Add more attributes as needed
    // }),
  });


export { Product, productJoiSchema };
