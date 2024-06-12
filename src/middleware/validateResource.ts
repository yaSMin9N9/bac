import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";
const validate =
  (schema: AnyZodObject) =>
  (request: Request, response: Response, next: NextFunction) => {
    try {
      const { body, query, params, files } = request;
      schema.parse({
        body,
        query,
        params,
        files,
      });
      next();
    } catch (error: any) {
      return response.status(422).send(error.errors);
    }
  };

export default validate;
