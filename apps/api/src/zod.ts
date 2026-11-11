import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

// Extend Zod before creating schemas so they can also be registered in OpenAPI.
extendZodWithOpenApi(z);

export { z };
