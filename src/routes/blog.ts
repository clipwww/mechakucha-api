import { OpenAPIHono } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import { z } from 'zod';

import { lruCache } from '../utilities/lru-cache';
import { ResultCode, ResultGenericVM } from '../view-models/result.vm';
import { addViewCount, getViewCount } from '../libs/blog.lib';

const app = new OpenAPIHono();

// Zod schemas
const ViewCountResponseSchema = z.object({
  success: z.boolean(),
  resultCode: z.string(),
  resultMessage: z.string(),
  item: z.any(),
}).openapi('ViewCountResponse');

// OpenAPI routes
const getViewCountRoute = createRoute({
  method: 'get',
  path: '/post/:id/view-count',
  summary: '取得文章瀏覽數',
  description: '根據文章 ID 取得瀏覽數統計',
  tags: ['Blog'],
  request: {
    params: z.object({
      id: z.string().min(1).openapi({
        description: '文章 ID',
        example: '12345'
      }),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ViewCountResponseSchema,
        },
      },
      description: '成功取得瀏覽數',
    },
  },
});

const addViewCountRoute = createRoute({
  method: 'post',
  path: '/post/:id/view-count',
  summary: '新增文章瀏覽數',
  description: '根據文章 ID 新增瀏覽數統計',
  tags: ['Blog'],
  request: {
    params: z.object({
      id: z.string().min(1).openapi({
        description: '文章 ID',
        example: '12345'
      }),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ViewCountResponseSchema,
        },
      },
      description: '成功新增瀏覽數',
    },
  },
});

// 註冊路由
app.openapi(getViewCountRoute, async (c) => {
  try {
    const { id } = c.req.param();
    const result = new ResultGenericVM();
    const cacheKey = `${id}-view-count`;

    const cacheValue = lruCache.get(cacheKey);

    if (cacheValue) {
      result.item = cacheValue;
    } else {
      const post = await getViewCount(id)
      result.item = post;
    }

    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    console.log(err)
    throw err;
  }
});

app.openapi(addViewCountRoute, async (c) => {
  try {
    const { id } = c.req.param();
    const result = new ResultGenericVM();
    const cacheKey = `${id}-view-count`;

    const post = await addViewCount(id)
    result.item = post;

    lruCache.set(cacheKey, post);

    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    console.log(err)
    throw err;
  }
});

export default app;