import { Request, ResponseToolkit } from "@hapi/hapi";
import Boom from "@hapi/boom";
import { Customer, UserStatus } from "../models/customers";

export const adminAuthMiddleware = (request: Request, h: ResponseToolkit) => {
  const { role } = request.auth.credentials;
  if (role !== "admin") {
    throw Boom.forbidden("Unauthorized access");
  }
  return h.continue;
};

export const vendorAuthMiddleware = (request: Request, h: ResponseToolkit) => {
  const { role } = request.auth.credentials;
  if (role !== "vendor") {
    throw Boom.forbidden("Sorry you are not a vendor");
  }
  return h.continue;
};

export const checkUserStatus = (request: Request, h: ResponseToolkit) => {
  const { customerId } = request.auth.credentials;
  const customer: any = Customer.findOne({
    customerId: customerId,
  });
  if (customer.status===UserStatus.DELETED) {
    throw Boom.unauthorized("Your account has been deleted");
  }
  return h.continue;
};
