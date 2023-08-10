import jwt, { Secret } from 'jsonwebtoken';
import Hapi from '@hapi/hapi';
import Boom from '@hapi/boom'; // Import the Boom module for error handling

const secretKey = process.env.SECRET_KEY || 'default-secret-key';

// Define the validation function type
type ValidateFuncType = (
  decoded: any,
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) => Promise<Hapi.Lifecycle.ReturnValueTypes>;

// Define the validateToken function using the ValidateFuncType
export const validateToken: ValidateFuncType = async (decoded, request, h) => {
  try {
    // Perform additional checks or validations here if needed
    // For example, you could check if the customer still exists in the database

    const credentials: Hapi.Lifecycle.ReturnValueTypes = {
      isValid: true,
      credentials: {
        customerId: decoded.customerId,
        role: decoded.role,
      },
    };

    return credentials;
  } catch (error) {
    throw Boom.unauthorized('Invalid token'); // Create an unauthorized error using Boom
  }
};
