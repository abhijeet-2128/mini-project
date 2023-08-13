import mongoose, { Document, Schema } from 'mongoose';

export interface CategoryDoc extends Document {
  name: string;
  description?: string;
  parent_category: Schema.Types.ObjectId | CategoryDoc | null; // Change here
  created_at: Date;
  updated_at: Date;
}

const categorySchema = new mongoose.Schema<CategoryDoc>({
  name: { type: String, required: true },
  description: { type: String },
  parent_category: { type: Schema.Types.ObjectId, ref: 'Category', default: null }, // Change here
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

categorySchema.pre<CategoryDoc>('save', function (next) {
  this.updated_at = new Date();
  next();
});

const Category = mongoose.model<CategoryDoc>('Category', categorySchema);

export default Category;
