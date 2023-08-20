// routes.ts
import { ServerRoute } from '@hapi/hapi';
import {CategoryController } from '../controller/categories.controller';

const api = process.env.API_URL;

const categoryRoutes: ServerRoute[] = [
    // add category
    {
        method: 'POST',
        path: api + '/categories',
        handler: CategoryController.addCategory,
        options: {
            auth: 'jwt'
          }
    },
    // Get all categories
    {
        method: 'GET',
        path: api + '/categories',
        handler: CategoryController.getCategories,
        options: {
            auth: false, // No authentication required
        },
    },

    // Get a category by ID
    {
        method: 'GET',
        path: api + '/categories/{categoryId}',
        handler: CategoryController.getCategory,
        options: {
            auth: false, // No authentication required
        },
    },

    // Update a category by ID (Admin only)
    {
        method: 'PUT',
        path: api + '/categories/{categoryId}',
        handler: CategoryController.updateCategory,
        options: {
            auth: 'jwt'
          }
    },

    // Delete a category by ID (Admin only)
    {
        method: 'DELETE',
        path: api + '/categories/{categoryId}',
        handler: CategoryController.deleteCategory,
        options: {
            auth: 'jwt'
          }
    },
];

export default categoryRoutes;
