import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

const REQUEST_CONTEXT_KEY = Symbol('REQUEST_CONTEXT');

export function setRequestContext(context: any) {
  Reflect.defineMetadata(REQUEST_CONTEXT_KEY, context, Request);
}

export function getRequestContext(): any {
  return Reflect.getMetadata(REQUEST_CONTEXT_KEY, Request);
}

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const user = req.user; // Assuming you're using Passport
    setRequestContext({ user });
    next();
  }
}
