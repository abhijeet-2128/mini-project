import { ServerRoute } from '@hapi/hapi';
import { ProductController } from '../controller/products.controller';
import { adminAuthMiddleware } from '../middleware/admin.check';


const api = process.env.API_URL;

const productRoutes: ServerRoute[] = [
    {
        method: 'POST',
        path: api + '/products',
        handler: ProductController.addProduct,
        options: {
            auth: 'jwt',
            pre: [{ method: adminAuthMiddleware }],
        },
    },

    // get all products 
    {
        method: 'GET',
        path: api + '/products',
        handler: ProductController.getAllProducts,
    },
    // Get a product by ID
    {
        method: 'GET',
        path: api + '/products/{productId}',
        handler: ProductController.getProduct,
    },

    //filter products
    {
        method: 'GET',
        path: api + '/products/filter',
        handler: ProductController.filterByCategory,
    },

    {
        method: 'PUT',
        path: api + '/products/{productId}',
        handler: ProductController.updateProduct,
        options: {
            auth: 'jwt',
            pre: [{ method: adminAuthMiddleware }],
        },
    },

    {
        method: 'DELETE',
        path: api + '/products/{productId}',
        handler: ProductController.deleteProduct,
        options: {
            auth: 'jwt',
            pre: [{ method: adminAuthMiddleware }],
        },  
    },
    {
        method:'POST',
        path:api+'/upload-product-image',
        handler: ProductController.uploadProductImage,
        options: {
            auth: 'jwt',
            pre: [{ method: adminAuthMiddleware }],
            payload: {
                output:'stream',
                parse: true,
                multipart: {
                    output:'stream'
                },
                allow: 'multipart/form-data',
                
            }
        }
    }
];

export default productRoutes;
