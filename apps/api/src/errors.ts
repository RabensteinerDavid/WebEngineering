import { STATUS_CODES } from 'node:http';
import { randomUUID } from 'node:crypto';
import type { ErrorRequestHandler, RequestHandler } from 'express';

const badRequest = 400;
const notFound = 404;
const badGateway = 502;
const gatewayTimeout = 504;
const internalError = 500;

interface FieldError {
  field: string;
  message: string;
}

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    detail: string,
    public readonly errors: FieldError[] = [],
    cause?: unknown
  ) {
    super(detail, { cause });
  }
}

export class ValidationError extends HttpError {
  constructor(detail: string, errors: FieldError[]) {
    super(badRequest, detail, errors);
  }
}

export class NotFoundError extends HttpError {
  constructor(detail: string) {
    super(notFound, detail);
  }
}

export class UpstreamError extends HttpError {
  constructor(timedOut = false, cause?: unknown) {
    super(
      timedOut ? gatewayTimeout : badGateway,
      timedOut
        ? 'Wikipedia took too long to respond.'
        : 'Could not load bear data from Wikipedia.',
      [],
      cause
    );
  }
}

export const requestLogger: RequestHandler = (request, response, next) => {
  const incomingId = request.get('x-request-id');
  const requestId =
    incomingId !== undefined && /^[a-zA-Z0-9_\-]{1,128}$/v.test(incomingId)
      ? incomingId
      : randomUUID();
  response.setHeader('x-request-id', requestId);
  response.on('finish', () => {
    const errorMessage: unknown = response.locals.errorMessage;

    process.stdout.write(
      `${JSON.stringify({
        requestId,
        method: request.method,
        path: request.originalUrl,
        status: response.statusCode,
        ...(typeof errorMessage === 'string' ? { error: errorMessage } : {}),
      })}\n`
    );
  });
  next();
};

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _request,
  response,
  next
) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  const { locals } = response;

  let problem = new HttpError(
    internalError,
    'An unexpected server error occurred.'
  );
  if (error instanceof HttpError) {
    problem = error;
  } else if (
    error instanceof SyntaxError &&
    'type' in error &&
    error.type === 'entity.parse.failed'
  ) {
    problem = new ValidationError('The request body contains invalid JSON.', [
      { field: 'body', message: 'Provide valid JSON.' },
    ]);
  }

  locals.errorMessage =
    error instanceof Error ? error.message : 'Unknown error';

  const requestId = String(response.getHeader('x-request-id'));
  response
    .status(problem.status)
    .type('application/problem+json')
    .json({
      type: 'about:blank',
      title: STATUS_CODES[problem.status],
      status: problem.status,
      detail: problem.message,
      instance: `/requests/${requestId}`,
      ...(problem.status === badRequest ? { errors: problem.errors } : {}),
    });
};
