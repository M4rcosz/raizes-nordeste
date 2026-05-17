import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ApplicationError } from '@shared/errors/application/application.error';
import { DomainError } from '@shared/errors/domain/domain.error';
import type { ErrorEnvelope } from '@shared/errors/error-envelope.type';
import { KIND_TO_STATUS } from '@shared/errors/errors.type';
import { Request } from 'express';
import { STATUS_CODES } from 'node:http';

@Catch()
export class GlobalErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalErrorFilter.name);
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const ctxRequest = ctx.getRequest<Request>();
    const path = httpAdapter.getRequestUrl(ctxRequest) as string;

    let statusCode: number;
    let message: string;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else {
        const body = res as { message?: string | string[] };
        message = Array.isArray(body.message)
          ? body.message.join(', ')
          : (body.message ?? 'Internal Server Error');
      }
    } else if (exception instanceof ApplicationError || exception instanceof DomainError) {
      statusCode = KIND_TO_STATUS[exception.kind];
      message = exception.message;
    } else {
      statusCode = 500;
      message = 'Internal Server Error';
    }

    const responseBody: ErrorEnvelope = {
      statusCode,
      message,
      error: STATUS_CODES[statusCode] ?? 'Error',
      timestamp: new Date().toISOString(),
      path,
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, statusCode);

    //  =====================================
    //                  LOGS
    //  =====================================

    if (statusCode >= 400 && statusCode < 500) {
      this.logger.warn({
        message,
        method: ctxRequest.method,
        path,
      });
    } else if (statusCode >= 500) {
      this.logger.error(
        {
          message,
          method: ctxRequest.method,
          path,
          causes: this.flattenCauses(exception),
        },
        exception instanceof Error ? exception.stack : undefined,
      );
    }
  }

  private flattenCauses(err: unknown): string[] {
    const causes: string[] = [];
    let current: unknown = err instanceof Error ? err.cause : undefined;
    const limit = 5;

    while (current instanceof Error && causes.length < limit) {
      causes.push(current.message);
      current = current.cause;
    }

    return causes;
  }
}
