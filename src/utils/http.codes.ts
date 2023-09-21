import { ResponseObject, ResponseToolkit } from "@hapi/hapi";

export const HTTP = {
    SUCCESS: 200,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    ALREADY_EXISTS: 409,
    CONFLICT: 409,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    ERROR:500
  };


  export class httpResponse {
    async sendResponse(
      h: ResponseToolkit,
      b: any,
      d: any = {},
      statusCode: number = 200
    ) {
      const response: ResponseObject = h.response({ ...b, data: d });
      response.code(statusCode);
      return response;
    }
  }