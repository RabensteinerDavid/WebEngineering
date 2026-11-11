import { z } from './zod.js';
import {
  OpenAPIRegistry,
  OpenApiGeneratorV31,
  type ResponseConfig,
} from '@asteasolutions/zod-to-openapi';
import { bearSchema } from './bears.js';
import { commentSchema, newCommentSchema } from './comment-routes.js';
import { problemSchema } from './errors.js';

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
  id: z.string().describe('Binomial slug, for example u-arctos.'),
});
const commentParams = z.object({
  commentId: z
    .string()
    .describe('Comment ID returned when creating a comment.'),
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

const serverErrors = {
  '500': problemResponse(
    'Unexpected server error; no internal details are exposed.'
  ),
};
const upstreamErrors = {
  ...serverErrors,
  '502': problemResponse('Wikipedia unavailable or returned invalid data.'),
  '504': problemResponse('Wikipedia request timed out.'),
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
  summary: 'List all bears',
  request: { headers: requestHeaders },
  responses: {
    '200': jsonResponse('Bears in Wikipedia order.', z.array(bear)),
    ...upstreamErrors,
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
    ...upstreamErrors,
  },
});
registry.registerPath({
  method: 'get',
  path: '/api/bears/{id}/comments',
  summary: 'List comments for a bear',
  request: { params: bearParams, headers: requestHeaders },
  responses: {
    '200': jsonResponse('Comments for this bear.', z.array(comment)),
    '404': notFound,
    ...upstreamErrors,
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
    ...upstreamErrors,
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
  method: 'delete',
  path: '/api/comments/{commentId}',
  summary: 'Delete a comment',
  request: { params: commentParams, headers: requestHeaders },
  responses: {
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
