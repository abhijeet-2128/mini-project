import Hapi from '@hapi/hapi';
import Category, { CategoryDoc } from '../models/categories';
import Joi from 'joi';

const categoryJoiSchema = Joi.object<CategoryDoc>({
  name: Joi.string().required(),
  description: Joi.string(),
  parent_category: Joi.string().allow(null),  // Assuming parent_category is a string representation of ObjectId
});

export const addCategory = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    try {
      const { error, value } = categoryJoiSchema.validate(request.payload);
  
      if (error) {
        return h.response({ message: 'Invalid payload', error }).code(400);
      }
  
      const { name, description, parent_category } = value;
  
      // Check if a category with the same name already exists
      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        return h.response({ message: 'Category with the same name already exists' }).code(409);
      }
  
      if (parent_category) {
        // Check if the provided parent_category exists in the database
        const parentCategory = await Category.findById(parent_category);
        if (!parentCategory) {
          return h.response({ message: 'Parent category not found' }).code(404);
        }
      }
  
      const newCategory = new Category({ name, description, parent_category });
      await newCategory.save();
  
      return h.response({ message: 'Category created successfully', category: newCategory }).code(201);
    } catch (error) {
      return h.response({ message: 'Error creating category', error }).code(500);
    }
  };
  
// Get all categories
export const getCategories = async (_request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    try {
      const categories = await Category.find();
      return h.response(categories).code(200);
    } catch (error: any) {
      console.error(error);
      return h.response({ message: 'Error fetching categories' }).code(500);
    }
  };
  
export const getCategory = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
  try {
    const categoryId = request.params.categoryId;
    const category = await Category.findById(categoryId).populate('parent_category');

    if (!category) {
      return h.response({ message: 'Category not found' }).code(404);
    }

    return h.response({ category }).code(200);
  } catch (error) {
    return h.response({ message: 'Error retrieving category', error }).code(500);
  }
};

// Update a category by ID (Admin only)
export const updateCategory = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    try {
      const categoryId = request.params.categoryId;
      const { error, value } = categoryJoiSchema.validate(request.payload);
  
      if (error) {
        return h.response({ message: 'Invalid payload', error }).code(400);
      }
  
      const { name, description } = value;
  
      const updatedCategory = await Category.findByIdAndUpdate(
        categoryId,
        { name, description },
        { new: true }
      );
  
      if (!updatedCategory) {
        return h.response({ message: 'Category not found' }).code(404);
      }
  
      return h.response({ message: 'Category updated successfully' }).code(200);
    } catch (error: any) {
      console.error(error);
      return h.response({ message: 'Error updating category' }).code(500);
    }
  };
  
  // Delete a category by ID (Admin only)
  export const deleteCategory = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    try {
      const categoryId = request.params.categoryId;
      const deletedCategory = await Category.findByIdAndDelete(categoryId);
  
      if (!deletedCategory) {
        return h.response({ message: 'Category not found' }).code(404);
      }
  
      return h.response({ message: 'Category deleted successfully' }).code(200);
    } catch (error: any) {
      console.error(error);
      return h.response({ message: 'Error deleting category' }).code(500);
    }
  };
  