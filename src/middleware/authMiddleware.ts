import Hapi from '@hapi/hapi';
import jwt, { Secret } from 'jsonwebtoken';

const secretKey = process.env.SECRET_KEY || 'default-secret-key';

export const isAdmin: Hapi.Lifecycle.Method = (request, h) => {     
  const token = request.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return h.response({ message: 'Missing authentication token' }).code(401);
  }

  try {
    const decodedToken = jwt.verify(token, secretKey as Secret) as { customerId: string; role: string };

    if (!decodedToken || decodedToken.role !== 'admin') {
      return h.response({ message: 'Unauthorized' }).code(403);
    }
 

    return h.continue;
  } catch (error) {
    return h.response({ message: 'Invalid token' }).code(401);
  }
};
