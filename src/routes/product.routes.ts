import { ServerRoute } from '@hapi/hapi';
import { ProductController } from '../controller/products.controller';
// import { adminAuthMiddleware } from '../middleware/auth.check';
import { vendorAuthMiddleware ,adminAuthMiddleware} from '../middleware/auth.check';
import { productJoiSchema } from '../models/products';
import Joi from 'joi';


const api = process.env.API_URL;

const productRoutes: ServerRoute[] = [
    {
        method: 'POST',
        path: api + '/products',
        handler: ProductController.addProduct,
        options: {
            tags: ['api', 'product'],
            description: 'Add product',
            validate: {
                payload: productJoiSchema,
            },
            auth: 'jwt',
            pre: [{ method: vendorAuthMiddleware }],
        },
    },

    // get all products 
    {
        method: 'GET',
        path: api + '/products',
        handler: ProductController.getAllProducts,
        options: {
            tags: ['api', 'product'],
            description: 'Get products',
        }
    },
    // Get a product by ID
    {
        method: 'GET',
        path: api + '/products/{productId}',
        handler: ProductController.getProduct,
        options: {
            tags: ['api', 'product'],
            description: 'Get product by Id',
            validate: {
                params: Joi.object({
                    productId: Joi.string().required(),
                }),
            },
        }

    },

    //filter products
    {
        method: 'GET',
        path: api + '/products/filter',
        handler: ProductController.filterByCategory,
        options: {
            tags: ['api', 'product'],
            description: 'Filter product',
            validate: {
                query: Joi.object({
                    categoryId: Joi.string().required().optional(),
                    sortBy: Joi.string().valid('priceLowToHigh'),
                }),
            },
        }
    },

    {
        method: 'PUT',
        path: api + '/products/{productId}',
        handler: ProductController.updateProduct,
        options: {
            tags: ['api', 'product'],
            description: 'Update product',
            auth: 'jwt',
            pre: [{ method: vendorAuthMiddleware }],
            validate: {
                params: Joi.object({
                    productId: Joi.string().required(),
                }),
                payload: productJoiSchema,
            },
        },
    },

    {
        method: 'DELETE',
        path: api + '/products/{productId}',
        handler: ProductController.deleteProduct,
        options: {
            tags: ['api', 'product'],
            description: 'Delete product',
            auth: 'jwt',
            pre: [{ method: vendorAuthMiddleware }],
            validate: {
                params: Joi.object({
                    productId: Joi.string().required(),
                }),
            },
        },
    },



    {
        method: 'POST',
        path: api + '/upload-product-image',
        handler: ProductController.uploadProductImage,
        options: {
            auth: 'jwt',
            pre: [{ method: vendorAuthMiddleware }],
            tags: ['api', 'product'],
            plugins: { 'hapi-swagger': { payloadType: 'form' } },
            description: 'upload product image',
            validate: {
                payload: Joi.object({ file: Joi.any().meta({ swaggerType: 'file' }).description('file') }),
                query: Joi.object({
                    productId: Joi.string().required(),
                }),
            },
            payload: {
                output: 'stream',
                parse: true,
                multipart: {
                    output: 'stream'
                },
                allow: 'multipart/form-data',
            }
        }
    },

    {
        method: 'GET',
        path: api + "/searchProduct",
        options: {
            tags: ['api', 'product'],
            description: 'Search product',
            validate: {
                query: Joi.object({
                    text: Joi.string().required(),
                }),
            },
        },
        handler: ProductController.searchProduct
    }
];

export default productRoutes;
