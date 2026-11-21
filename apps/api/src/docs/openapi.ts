import { registrationSchema, userSchema } from '../models/users.js';
import { pageQuery } from '../models/pagination.js';
import { z } from '../config/zod.js';
import {
  OpenAPIRegistry,
  OpenApiGeneratorV31,
  type ResponseConfig,
} from '@asteasolutions/zod-to-openapi';
import { bearSchema, bearSearchQuery } from '../models/bears.js';
import { commentSchema, newCommentSchema } from '../models/comments.js';
import { problemSchema } from '../errors.js';

const registry = new OpenAPIRegistry();
const bear = registry.register('Bear', bearSchema);
const comment = registry.register('Comment', commentSchema);
const newComment = registry.register('NewComment', newCommentSchema);
const problem = registry.register('ProblemDetails', problemSchema);
const validationProblem = registry.register(
  'ValidationProblem',
  problemSchema.required({ errors: true })
);
const health = registry.register(
  'Health',
  z.object({
    status: z.literal('ok'),
    version: z.string(),
    uptime: z.number().nonnegative(),
  })
);

const responseHeaders = z.object({
  'x-request-id': z
    .string()
    .describe('Request identifier, also included in the API log.'),
});
const requestHeaders = z.object({
  'x-request-id': z
    .string()
    .optional()
    .describe('Optional request ID. Invalid IDs are replaced with a UUID.'),
});
const bearParams = z.object({
  id: bearSchema.shape.id.describe('Binomial slug, for example u-arctos.'),
});
const commentParams = z.object({
  commentId: commentSchema.shape.id.describe(
    'Comment ID returned when creating a comment.'
  ),
});

function jsonResponse(description: string, schema: z.ZodType): ResponseConfig {
  return {
    description,
    headers: responseHeaders,
    content: { 'application/json': { schema } },
  };
}

function problemResponse(
  description: string,
  schema: z.ZodType = problem
): ResponseConfig {
  return {
    description,
    headers: responseHeaders,
    content: { 'application/problem+json': { schema } },
  };
}

const rateLimitResponse: ResponseConfig = {
  ...problemResponse('Too many attempts; wait before retrying.'),
  headers: responseHeaders.extend({
    'Retry-After': z.string().describe('Seconds until retry.'),
  }),
};

const serverErrors = {
  '500': problemResponse(
    'Unexpected server error; no internal details are exposed.'
  ),
};
const notFound = problemResponse('Requested resource not found.');

registry.registerPath({
  method: 'get',
  path: '/health',
  summary: 'Check API health',
  request: { headers: requestHeaders },
  responses: {
    '200': jsonResponse('API is running.', health),
    ...serverErrors,
  },
});
registry.registerPath({
  method: 'get',
  path: '/api/bears',
  summary: 'List bears by name',
  request: {
    headers: requestHeaders,
    query: bearSearchQuery,
  },
  responses: {
    '200': jsonResponse('Bears in Wikipedia order.', z.array(bear)),
    ...serverErrors,
  },
});
registry.registerPath({
  method: 'get',
  path: '/api/bears/{id}',
  summary: 'Get one bear',
  request: { params: bearParams, headers: requestHeaders },
  responses: {
    '200': jsonResponse('Requested bear.', bear),
    '404': notFound,
    ...serverErrors,
  },
});
registry.registerPath({
  method: 'get',
  path: '/api/bears/{id}/comments',
  summary: 'List comments for a bear, newest first',
  request: { params: bearParams, headers: requestHeaders, query: pageQuery },
  responses: {
    '200': jsonResponse(
      'Comments for this bear.',
      z.object({ items: z.array(comment), nextCursor: z.string().nullable() })
    ),
    '400': problemResponse('Invalid pagination parameters.', validationProblem),
    '404': notFound,
    ...serverErrors,
  },
});
registry.registerPath({
  method: 'post',
  path: '/api/bears/{id}/comments',
  summary: 'Create a comment',
  request: {
    params: bearParams,
    headers: requestHeaders,
    body: {
      required: true,
      content: { 'application/json': { schema: newComment } },
    },
  },
  responses: {
    '401': problemResponse('Login required.'),
    '201': {
      ...jsonResponse('Comment created.', comment),
      headers: responseHeaders.extend({
        Location: z.string().describe('URL of the created comment.'),
      }),
    },
    '400': problemResponse(
      'Invalid JSON or comment fields.',
      validationProblem
    ),
    '404': notFound,
    ...serverErrors,
  },
});
registry.registerPath({
  method: 'get',
  path: '/api/comments/{commentId}',
  summary: 'Get one comment',
  request: { params: commentParams, headers: requestHeaders },
  responses: {
    '200': jsonResponse('Requested comment.', comment),
    '404': notFound,
    ...serverErrors,
  },
});
registry.registerPath({
  method: 'post',
  path: '/api/comments/{commentId}/report',
  summary: 'Report a comment; the third report hides it from the list',
  request: { params: commentParams, headers: requestHeaders },
  responses: {
    '200': jsonResponse('Updated comment.', comment),
    '404': notFound,
    ...serverErrors,
  },
});
registry.registerPath({
  method: 'delete',
  path: '/api/comments/{commentId}',
  summary: 'Delete a comment',
  request: { params: commentParams, headers: requestHeaders },
  responses: {
    '401': problemResponse('Login required.'),
    '403': problemResponse(
      'Only the author or a moderator may delete this comment.'
    ),
    '204': {
      description: 'Comment deleted; no response body.',
      headers: responseHeaders,
    },
    '404': notFound,
    ...serverErrors,
  },
});
registry.registerPath({
  method: 'get',
  path: '/api/debug/error',
  summary: 'Demonstrate an unexpected server error',
  request: { headers: requestHeaders },
  responses: serverErrors,
});

registry.registerPath({
  method: 'post',
  path: '/api/auth/register',
  summary: 'Register a user',
  request: {
    body: {
      required: true,
      content: { 'application/json': { schema: registrationSchema } },
    },
  },
  responses: {
    '201': jsonResponse('User registered.', userSchema),
    '400': problemResponse('Invalid registration details.', validationProblem),
    '409': problemResponse('Email already registered.'),
    '413': problemResponse('Request body exceeds 16 KB.'),
    '429': rateLimitResponse,
    ...serverErrors,
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/auth/login',
  summary: 'Log in and set a session cookie',
  request: {
    body: {
      required: true,
      content: { 'application/json': { schema: registrationSchema } },
    },
  },
  responses: {
    '200': jsonResponse('Logged-in user.', userSchema),
    '400': problemResponse('Invalid login details.', validationProblem),
    '401': problemResponse('Invalid credentials.'),
    '413': problemResponse('Request body exceeds 16 KB.'),
    '429': rateLimitResponse,
    ...serverErrors,
  },
});
registry.registerPath({
  method: 'get',
  path: '/api/auth/me',
  summary: 'Get the current user from the session cookie',
  responses: {
    '200': jsonResponse('Current user.', userSchema),
    '401': problemResponse('Not logged in.'),
    ...serverErrors,
  },
});
registry.registerPath({
  method: 'post',
  path: '/api/auth/logout',
  summary: 'Destroy the session and clear the cookie',
  responses: { '204': { description: 'Logged out.' }, ...serverErrors },
});

export function createOpenApiDocument(
  version: string
): ReturnType<OpenApiGeneratorV31['generateDocument']> {
  const generator = new OpenApiGeneratorV31(registry.definitions);
  return generator.generateDocument({
    openapi: '3.1.0',
    info: { title: 'Bears API', version },
    servers: [{ url: '/' }],
  });
}
