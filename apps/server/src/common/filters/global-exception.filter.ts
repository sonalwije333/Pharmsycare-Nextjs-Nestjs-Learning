import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm'; // or Prisma errors, etc.

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Something went wrong, please try again later';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : (res as any).message;
    } else if (exception instanceof QueryFailedError) {
      // TypeORM-specific error
      status = HttpStatus.BAD_REQUEST;
      message = 'The payload is not valid';
    } else if (exception instanceof Error && exception.name === 'ValidationError') {
      status = HttpStatus.BAD_REQUEST;
      message = 'Please provide valid detail';
    } else if (exception instanceof Error && exception.name === 'EntityNotFoundError') {
      status = HttpStatus.NOT_FOUND;
      message = 'The required object does not exist.';
    }
    // else if (exceptions instanceof KeyError) {
    //   status = HttpStatus.BAD_REQUEST;
    //   message = 'The required key does not exist.';
    // }

    // You can log the error here
    console.error(exception);

    response.status(status).json({
      statusCode: status,
      path: request.url,
      error: message,
    });
  }
}
