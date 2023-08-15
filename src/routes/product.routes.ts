// routes.ts
import { ServerRoute } from '@hapi/hapi';
import { addToCart, updateCartItem, removeCartItem, getCart } from '../controller/cart.controller';
import { addProduct, deleteProduct, filterByCategory, getAllProducts, getProduct, updateProduct } from '../controller/products.controller';
import { isAdmin } from '../middleware/authMiddleware';

const api = process.env.API_URL;

const productRoutes: ServerRoute[] = [
    {
        method: 'POST',
        path: api + '/products',
        handler: addProduct,
        options: {
            pre: [isAdmin], // Use the isAdmin middleware before handling the request
        },
    },

    // get all products 

    {
        method: 'GET',
        path: api + '/products',
        handler: getAllProducts,
        options: {
            auth: false, // No authentication required
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
   
    //filter products
    {
        method: 'GET',
        path: api + '/products/filter',
        handler: filterByCategory,
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
];

export default productRoutes;
