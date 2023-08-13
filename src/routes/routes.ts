import Hapi from '@hapi/hapi';
import { signup, login, getProfile, updateProfile, deleteProfile, logout } from '../controller/users.controller';
import { isAdmin } from '../middleware/authMiddleware';
import { addProduct, deleteProduct, getProduct, updateProduct } from '../controller/products.controller';
import { addCategory, deleteCategory, getCategories, getCategory, updateCategory } from '../controller/categories.controller';

const api = process.env.API_URL;

const authRoutes = [
  {
    method: 'POST',
    path: api + '/signup',
    handler: signup,
    options: {
      auth: false, // No authentication required for signup
    },
  },

  {
    method: 'POST',
    path: api + '/login',
    handler: login,
    options: {
      auth: false, // No authentication required for signup
    },
  },

  {
    method: 'POST',
    path: api+ '/logout',
    handler: logout
  },

  {
    method: 'GET',
    path: api + '/profile',
    handler: getProfile,
    options:{
      auth:'jwt'
    }
  },

  {
    method: 'PUT',
    path : api + '/profile',
    handler: updateProfile,
    options:{
      auth:'jwt'
    }
  },

  {
    method : 'DELETE',
    path: api+ '/profile',
    handler: deleteProfile,
    options:{
      auth:'jwt'
    }
  },



  {
    method: 'POST',
    path: api + '/products',
    handler: addProduct,
    options: {
      pre: [isAdmin], // Use the isAdmin middleware before handling the request
    },
  },

    // Get a product by ID
    {
      method: 'GET',
      path: api + '/products/{productId}',
      handler: getProduct,
      options: {
        auth: false, // No authentication required
      },
    },

    {
      method: 'PUT',
      path: api + '/products/{productId}',
      handler: updateProduct,
      options: {
        pre: [isAdmin],
      },
    },

    {
    method: 'DELETE',
    path: api + '/products/{productId}',
    handler: deleteProduct,
    options: {
      pre: [isAdmin],
    },
    },

//--categories---------------
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

export default authRoutes;
