// routes.ts
import { ServerRoute } from '@hapi/hapi';
import { isAdmin } from '../middleware/authMiddleware';
import { addCategory, deleteCategory, getCategories, getCategory, updateCategory } from '../controller/categories.controller';

const api = process.env.API_URL;

const categoryRoutes: ServerRoute[] = [
    // add category
    {
        method: 'POST',
        path: api + '/categories',
        handler: addCategory,
        options: {
            pre: [isAdmin],
        },
    },
    // Get all categories
    {
        method: 'GET',
        path: api + '/categories',
        handler: getCategories,
        options: {
            auth: false, // No authentication required
        },
    },

    // Get a category by ID
    {
        method: 'GET',
        path: api + '/categories/{categoryId}',
        handler: getCategory,
        options: {
            auth: false, // No authentication required
        },
    },

    // Update a category by ID (Admin only)
    {
        method: 'PUT',
        path: api + '/categories/{categoryId}',
        handler: updateCategory,
        options: {
            pre: [isAdmin],
        },
    },

    // Delete a category by ID (Admin only)
    {
        method: 'DELETE',
        path: api + '/categories/{categoryId}',
        handler: deleteCategory,
        options: {
            pre: [isAdmin],
        },
    },
];

export default categoryRoutes;
