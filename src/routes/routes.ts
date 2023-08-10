import Hapi from '@hapi/hapi';
import { signup, login, getProfile, updateProfile, deleteProfile, logout } from '../controller/users.controller';
import { isAdmin } from '../middleware/authMiddleware';
import { addProduct } from '../controller/products.controller';

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
    path: api + '/product',
    handler: addProduct,
    options: {
      pre: [isAdmin], // Use the isAdmin middleware before handling the request
    },
  },
  
 
  
];

export default authRoutes;
