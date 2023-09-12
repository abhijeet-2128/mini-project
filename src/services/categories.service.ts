import Category from '../models/categories';

export class CategoryService {
    static async addCategory(name: string, description: string, parent_category?: string) {
        // Check if a category with the same name already exists
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            throw new Error('Category with the same name already exists');
        }

        let newCategory;
        if (parent_category) {
            // Check if the provided parent_category exists in the database
            const parentCategory = await Category.findById(parent_category);
            if (!parentCategory) {
                throw new Error('Parent category not found');
            }

            // Add subcategory
            newCategory = new Category({ name, description, parent_category });
        } else {
            // Add top-level category
            newCategory = new Category({ name, description });
        }
        await newCategory.save();
        return newCategory;
    }

//get All categories
    static async getCategories() {
        return Category.find();
    }


    static async getCategory(parentId: string) {
        const parentCategory = await Category.findById(parentId);
        if (!parentCategory) {
            throw new Error('Parent category not found');
        }
        const subcategories = await Category.find({ parent_category: parentCategory._id });
        return subcategories;
    }


    static async updateCategory(categoryId: string, name: string, description: string) {
        const updatedCategory = await Category.findByIdAndUpdate(
            categoryId,
            { name, description },
            { new: true }
        );

        if (!updatedCategory) {
            throw new Error('Category not found');
        }

        return updatedCategory;
    }

    static async deleteCategory(categoryId: string) {
        const deletedCategory = await Category.findByIdAndDelete(categoryId);

        if (!deletedCategory) {
            throw new Error('Category not found');
        }
    }
}
