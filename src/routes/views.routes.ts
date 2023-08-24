import Hapi, { ServerRoute } from "@hapi/hapi";


export const ViewRoutes :ServerRoute[]= [
    {
        method: "GET",
        path: '/',
        
        handler: (request:any ,h: any) => {
            return h.view('index');
        }
    },

    {
        method: 'GET',
        path: '/home',
        handler: (request: any, h: any) => {
            return h.view('index')
            // try {
            //     const user = JSON.parse(request.query.user);
            //     if (user) {
            //         return h.view('home', { user: user });
            //     }
            //     return h.view('/home');              
            // } catch (err) {
            //     console.error(err);
                
            // }
        }
    },

    {
        method: "GET",
        path: '/sign-in',
        
        handler: (request:any ,h: any) => {
            return h.view('sign-in');
        }
    },

    {
        method: "GET",
        path: '/product',
        
        handler: (request:any ,h: any) => {
            return h.view('product');
        }
    },
   
    
   
]