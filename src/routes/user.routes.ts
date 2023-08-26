import { ServerRoute } from '@hapi/hapi';
import { UserController } from '../controller/users.controller';
import dotenv from 'dotenv';
import Joi from 'joi';
import { customerLoginJoiSchema, customerSignupJoiSchema } from '../models/customers';

dotenv.config();

const api = process.env.API_URL;

const userRoutes: ServerRoute[] = [
  {
    method: 'POST',
    path: api + '/signup',
    handler: UserController.signup,
    options: {
      tags: ['api', 'user'],
      description: 'User signup',
      validate: {
        payload: customerSignupJoiSchema,
      },
    }
  },

  {
    method: 'POST',
    path: api + '/login',
    handler: UserController.login,
    options: {
      tags: ['api', 'user'],
      description: 'User login',
      validate: {
        payload: customerLoginJoiSchema,
      },
    },
  },

  {
    method: 'POST',
    path: api + '/logout',
    handler: UserController.logout,
    options: {
      tags: ['api', 'user'],
      description: 'User logout',
      auth: 'jwt',
      plugins: {
        'hapi-swagger': {
          security: [{ jwt: [] }],
        },
      },
    }
  },

  {
    method: 'GET',
    path: api + '/profile',
    handler: UserController.getProfile,
    options: {
      tags: ['api', 'user'],
      description: 'User profile',
      auth: 'jwt',
      plugins: {
        'hapi-swagger': {
          security: [{ jwt: [] }],
        },
      },
    }
  },

  {
    method: 'PUT',
    path: api + '/profile',
    handler: UserController.updateProfile,
    options: {
      tags: ['api', 'user'],
      description: 'Update profile',
      auth: 'jwt',
      plugins: {
        'hapi-swagger': {
          security: [{ jwt: [] }],
        },
      },
    }
  },

  {
    method: 'DELETE',
    path: api + '/profile',
    handler: UserController.deleteProfile,
    options: {
      tags: ['api', 'user'],
      description: 'Delete profile',
      auth: 'jwt',
      plugins: {
        'hapi-swagger': {
          security: [{ jwt: [] }],
        },
      },
    }
  },
  {
    method: 'POST',
    path: api + '/forget-password',
    handler: UserController.forgetPassword,
    options: {
      tags: ['api', 'user'],
      description: 'Forget password',
    }
  },
  {
    method: 'POST',
    path: api + '/reset-password',
    handler: UserController.resetPassword,
    options: {
      tags: ['api', 'user'],
      description: 'Reset Password',
      validate: {
        payload: Joi.object({
          otp: Joi.number().required(),
          email: Joi.string().required(),
          newPassword: Joi.string().required()
        })
      }

    }
  },
];

export default userRoutes;
