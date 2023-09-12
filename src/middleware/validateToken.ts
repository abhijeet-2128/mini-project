import Hapi from '@hapi/hapi';
import Boom from '@hapi/boom';

type AuthCredentials = {
  isValid: boolean;
  credentials?: {
    customerId: string;
    role: string;
  };
};

export const validateToken = async (decoded: any, request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<AuthCredentials> => {
  try {
    const credentials: AuthCredentials = {
      isValid: true,
      credentials: {
        customerId: decoded.customerId,
        role: decoded.role,
      },
    };
    return credentials;
  } catch (error) {
    throw Boom.unauthorized('Invalid token');
  }
};



