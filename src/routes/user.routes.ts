import { ServerRoute } from '@hapi/hapi';
import { UserController } from '../controller/users.controller';
import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();

const api = process.env.API_URL;

const userRoutes :ServerRoute[]= [
  {
    method: 'POST',
    path: api + '/signup',
    handler: UserController.signup,
    options: {
      auth: false, // No authentication required
    },
  },

  {
    method: 'POST',
    path: api + '/login',
    handler: UserController.login,
    options: {
      auth: false, 
    },
  },

  {
    method: 'POST',
    path: api + '/logout',
    handler: UserController.logout,
    options: {
      auth: 'jwt'
    }
  },

  {
    method: 'GET',
    path: api + '/profile',
    handler: UserController.getProfile,
    options: {
      auth: 'jwt'
    }
  },

  {
    method: 'PUT',
    path: api + '/profile',
    handler: UserController.updateProfile,
    options: {
      auth: 'jwt'
    }
  },

  {
    method: 'DELETE',
    path: api + '/profile',
    handler: UserController.deleteProfile,
    options: {
      auth: 'jwt'
    }
  },
  {
    method: 'POST',
    path: api + '/forget-password',
    handler: UserController.forgetPassword ,
    options: {
      auth: false
    }
  },
  {
    method: 'POST',
    path: api + '/reset-password',
    handler: UserController.resetPassword ,
    options: {
      auth: false,
      validate: {
        payload: Joi.object({
            otp: Joi.number().required(),
            email: Joi.string().required(),
            newPassword:Joi.string().required()
        })
    }

    }
  },
];

export default userRoutes;
