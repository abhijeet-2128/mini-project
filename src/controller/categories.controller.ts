import { Request, ResponseToolkit } from '@hapi/hapi';
import { CategoryService } from '../services/categories.service';
import { categoryJoiSchema } from '../models/categories';

export class CategoryController {
  static async addCategory(request: Request, h: ResponseToolkit) {
    try {
      const { name, description, parent_category }:any = request.payload;
      await categoryJoiSchema.validateAsync({ name, description, parent_category });

      const newCategory = await CategoryService.addCategory(name, description, parent_category);
      return h.response({ message: 'Category created successfully', category: newCategory }).code(201);
    } catch (error) {
      console.error(error);
      return h.response({ message: 'Error creating category', error }).code(500);
    }
  }

  static async getCategories(_request: Request, h: ResponseToolkit) {
    try {
      const categories = await CategoryService.getCategories();
      return h.response(categories).code(200);
    } catch (error) {
      console.error(error);
      return h.response({ message: 'Error fetching categories' }).code(500);
    }
  }

  static async getCategory(request: Request, h: ResponseToolkit) {
    try {
      const parentId = request.params.parentId;
      const subcategories = await CategoryService.getCategory(parentId);
      return h.response({ subcategories }).code(200);
    } catch (error) {
      console.error(error);
      return h.response({ message: 'Error retrieving subcategories', error }).code(500);
    }
  }

  static async updateCategory(request: Request, h: ResponseToolkit) {
    try {
      const categoryId = request.params.categoryId;
      const { name, description }:any = request.payload;
      await categoryJoiSchema.validateAsync({ name, description });

      const updatedCategory = await CategoryService.updateCategory(categoryId, name, description);
      return h.response({ message: 'Category updated successfully', category: updatedCategory }).code(200);
    } catch (error) {
      console.error(error);
      return h.response({ message: 'Error updating category', error }).code(500);
    }
  }

  static async deleteCategory(request: Request, h: ResponseToolkit) {
    try {
      const categoryId = request.params.categoryId;
      await CategoryService.deleteCategory(categoryId);
      return h.response({ message: 'Category deleted successfully' }).code(200);
    } catch (error) {
      console.error(error);
      return h.response({ message: 'Error deleting category', error }).code(500);
    }
  }
}
