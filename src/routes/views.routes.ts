import { ServerRoute } from "@hapi/hapi";

export const ViewRoutes: ServerRoute[] = [
    {
        method: "GET",
        path: '/',
        handler: (request: any, h: any) => {
            return h.view('index');
        }
    },

    {
        method: 'GET',
        path: '/home',
        handler: (request: any, h: any) => {
            return h.view('index')
        }
    },

    {
        method: "GET",
        path: '/sign-in',

        handler: (request: any, h: any) => {
            return h.view('sign-in');
        }
    },

    {
        method: "GET",
        path: '/product',

        handler: (request: any, h: any) => {
            return h.view('product');
        }
    },



]