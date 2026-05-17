import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ArgumentsHost, BadRequestException, HttpException, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ApplicationError } from '@shared/errors/application/application.error';
import { ERROR_KINDS, type ErrorKind, KIND_TO_STATUS } from '@shared/errors/errors.type';
import { GlobalErrorFilter } from './global-error.filter';
import { DomainError } from '@shared/errors/domain/domain.error';

describe('GlobalErrorFilter', () => {
  let filter: GlobalErrorFilter;
  let reply: jest.Mock;
  let getRequestUrl: jest.Mock;
  let warnSpy: jest.SpiedFunction<typeof Logger.prototype.warn>;
  let errorSpy: jest.SpiedFunction<typeof Logger.prototype.error>;

  const RESPONSE = {} as unknown;

  const buildHost = (method = 'GET'): ArgumentsHost =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ method }),
        getResponse: () => RESPONSE,
      }),
    }) as unknown as ArgumentsHost;

  beforeEach(() => {
    reply = jest.fn();
    getRequestUrl = jest.fn().mockReturnValue('/api/products');

    const httpAdapterHost = {
      httpAdapter: { reply, getRequestUrl },
    } as unknown as HttpAdapterHost;

    filter = new GlobalErrorFilter(httpAdapterHost);

    warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('maps an ApplicationError(unavailable) to 503 with the right envelope', () => {
    const error = new ApplicationError(
      ERROR_KINDS.UNAVAILABLE,
      'Could not retrieve active products.',
    );

    filter.catch(error, buildHost());

    expect(reply).toHaveBeenCalledTimes(1);
    const [responseArg, body, status] = reply.mock.calls[0];

    expect(responseArg).toBe(RESPONSE);
    expect(status).toBe(503);
    expect(body).toEqual({
      statusCode: 503,
      error: 'Service Unavailable',
      message: 'Could not retrieve active products.',
      path: '/api/products',
      timestamp: expect.any(String),
    });
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it.each(Object.entries(KIND_TO_STATUS))(
    'maps kind %s -> status %i in ApplicationError',
    (kind: string, expectedStatus: number) => {
      const error = new ApplicationError(kind as ErrorKind, 'fetch failed');

      filter.catch(error, buildHost());

      expect(reply).toHaveBeenCalledTimes(1);
      const [, , status] = reply.mock.calls[0];

      expect(status).toBe(expectedStatus);
    },
  );

  it.each(Object.entries(KIND_TO_STATUS))(
    'maps kind %s -> status %i in DomainError',
    (kind: string, expectedStatus: number) => {
      const error = new DomainError(kind as ErrorKind, 'fetch failed');

      filter.catch(error, buildHost());

      expect(reply).toHaveBeenCalledTimes(1);
      const [, , status] = reply.mock.calls[0];

      expect(status).toBe(expectedStatus);
    },
  );

  it('should return a concatenated error message', () => {
    const error = new BadRequestException(['Property 1', 'Property 2']);

    filter.catch(error, buildHost());

    expect(reply).toHaveBeenCalledTimes(1);
    const [, body, status] = reply.mock.calls[0];

    expect(body).toEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Property 1, Property 2',
      path: '/api/products',
      timestamp: expect.any(String),
    });

    expect(status).toBe(400);

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('should return the error response even when an HttpException is thrown', () => {
    const error = new HttpException('Bad Request Message', 400);

    filter.catch(error, buildHost());

    expect(reply).toHaveBeenCalledTimes(1);
    const [, body, status] = reply.mock.calls[0];

    expect(body).toEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Bad Request Message',
      path: '/api/products',
      timestamp: expect.any(String),
    });
    expect(status).toBe(400);
  });

  it('should not return an internal secret or stack', () => {
    const error = new Error('Internal Secret');

    filter.catch(error, buildHost());

    expect(reply).toHaveBeenCalledTimes(1);
    const [, body, status] = reply.mock.calls[0];

    expect(body).toEqual({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Internal Server Error',
      path: '/api/products',
      timestamp: expect.any(String),
    });

    expect(JSON.stringify(body)).not.toContain('Internal Secret');

    expect(status).toBe(500);
  });

  it.each([
    'secret string error',
    null,
    42,
    { message: 'secret string in object error' },
    undefined,
  ])('should handle a non-error exception %p and return 500', (exception) => {
    filter.catch(exception, buildHost());

    expect(reply).toHaveBeenCalledTimes(1);
    const [, body, status] = reply.mock.calls[0];

    expect(JSON.stringify(body)).not.toContain('secret');
    expect(body).toEqual({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Internal Server Error',
      path: '/api/products',
      timestamp: expect.any(String),
    });

    expect(status).toBe(500);
  });

  it('should log a warning and not call the error logger', () => {
    const error = new BadRequestException('Bad Request Message');

    filter.catch(error, buildHost());
    expect(reply).toHaveBeenCalledTimes(1);
    const [, , status] = reply.mock.calls[0];

    expect(status).toBe(400);

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('should log an error and not call the warn logger', () => {
    const rootCause = new Error('Root cause');
    const error = new ApplicationError(ERROR_KINDS.UNAVAILABLE, 'Error Message', {
      cause: new Error('Outer cause', { cause: rootCause }),
    });

    filter.catch(error, buildHost());
    expect(reply).toHaveBeenCalledTimes(1);
    const [, , status] = reply.mock.calls[0];

    expect(status).toBe(503);
    expect(errorSpy).toHaveBeenCalledTimes(1);
    const loggedPayload: unknown = errorSpy.mock.calls[0][0];

    expect(loggedPayload).toEqual({
      causes: ['Outer cause', 'Root cause'],
      message: 'Error Message',
      method: 'GET',
      path: '/api/products',
    });

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('should not hang on a circular cause chain', () => {
    const a = new Error('A');
    const b = new Error('B');
    a.cause = b;
    b.cause = a;
    const error = new ApplicationError(ERROR_KINDS.UNAVAILABLE, 'Circular', {
      cause: a,
    });

    filter.catch(error, buildHost());

    expect(errorSpy).toHaveBeenCalledTimes(1);
    const loggedPayload = errorSpy.mock.calls[0][0] as { causes: string[] };

    expect(loggedPayload.causes.length).toBeLessThanOrEqual(5);
  }, 1000);
});
