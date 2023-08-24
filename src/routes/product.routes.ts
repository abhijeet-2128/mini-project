// routes.ts
import { ServerRoute } from '@hapi/hapi';
import { ProductController} from '../controller/products.controller';


const api = process.env.API_URL;

const productRoutes: ServerRoute[] = [
    {
        method: 'POST',
        path: api + '/products',
        handler: ProductController.addProduct,
        options: {
             auth:'jwt'
        },
    },

    // get all products 

    {
        method: 'GET',
        path: api + '/products',
        handler: ProductController.getAllProducts,
        options: {
            auth: false, // No authentication required
        },
    },
    // Get a product by ID
    {
        method: 'GET',
        path: api + '/products/{productId}',
        handler: ProductController.getProduct,
        options: {
            auth: false, // No authentication required
        },
    },
   
    //filter products
    {
        method: 'GET',
        path: api + '/products/filter',
        handler: ProductController.filterByCategory,
        options: {
          auth: false, // No authentication required
        },
      },

    {
        method: 'PUT',
        path: api + '/products/{productId}',
        handler: ProductController.updateProduct,
        options: {
            auth:'jwt'
        },
    },

    {
        method: 'DELETE',
        path: api + '/products/{productId}',
        handler: ProductController.deleteProduct,
        options: {
            auth: 'jwt'
          }
    },
];

export default productRoutes;
