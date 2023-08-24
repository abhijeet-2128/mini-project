// routes.ts
import { ServerRoute } from '@hapi/hapi';
import {CategoryController } from '../controller/categories.controller';
import { adminAuthMiddleware } from '../middleware/admin.check';

const api = process.env.API_URL;

const categoryRoutes: ServerRoute[] = [
    // add category
    {
        method: 'POST',
        path: api + '/categories',
        handler: CategoryController.addCategory,
        options: {
            auth: 'jwt',
            pre: [{ method: adminAuthMiddleware }],
        },
    },
    // Get all categories
    {
        method: 'GET',
        path: api + '/categories',
        handler: CategoryController.getCategories,
    },
    // Get a category by ID
    {
        method: 'GET',
        path: api + '/categories/{categoryId}',
        handler: CategoryController.getCategory,
    },

    // Update a category by ID (Admin only)
    {
        method: 'PUT',
        path: api + '/categories/{categoryId}',
        handler: CategoryController.updateCategory,
        options: {
            auth: 'jwt',
            pre: [{ method: adminAuthMiddleware }],
        },
    },

    // Delete a category by ID (Admin only)
    {
        method: 'DELETE',
        path: api + '/categories/{categoryId}',
        handler: CategoryController.deleteCategory,
        options: {
            auth: 'jwt',
            pre: [{ method: adminAuthMiddleware }],
        },
    },
];

export default categoryRoutes;
