import { OpenAPIHono } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import { z } from 'zod';

import { ResultCode, ResultListGenericVM } from '../view-models/result.vm';
import { getMovieLog, getMiLog } from '../libs/google-sheets.lib';

const app = new OpenAPIHono();

// Zod schemas
const MovieLogSchema = z.object({
  date: z.string().openapi({ example: '2024-01-15' }),
  movie: z.string().openapi({ example: '蜘蛛人：無家日' }),
  rating: z.string().optional().openapi({ example: '8.5' }),
  notes: z.string().optional().openapi({ example: '很好看' }),
}).openapi('MovieLog');

const MiLogSchema = z.object({
  date: z.string().openapi({ example: '2024-01-15' }),
  type: z.string().openapi({ example: 'sport' }),
  value: z.string().openapi({ example: '跑步 5km' }),
  notes: z.string().optional().openapi({ example: '晨跑' }),
}).openapi('MiLog');

const LogListResponseSchema = z.object({
  success: z.boolean(),
  resultCode: z.string(),
  resultMessage: z.string(),
  items: z.array(z.union([MovieLogSchema, MiLogSchema])),
}).openapi('LogListResponse');

// OpenAPI routes
const getMovieLogRoute = createRoute({
  method: 'get',
  path: '/movie',
  summary: '取得電影觀看日誌',
  description: '取得所有電影觀看記錄',
  tags: ['我的 Log'],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: LogListResponseSchema,
        },
      },
      description: '成功取得電影日誌',
    },
  },
});

const getMiLogRoute = createRoute({
  method: 'get',
  path: '/mi/:type',
  summary: '取得 MI 日誌',
  description: '根據類型取得 MI（個人記錄）日誌',
  tags: ['我的 Log'],
  request: {
    params: z.object({
      type: z.string().min(1).openapi({
        description: '日誌類型',
        example: 'sport'
      }),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: LogListResponseSchema,
        },
      },
      description: '成功取得 MI 日誌',
    },
  },
});

// 註冊路由
app.openapi(getMovieLogRoute, async (c) => {
  try {
    const result = new ResultListGenericVM();

    result.items = await getMovieLog();

    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    throw err;
  }
});

app.openapi(getMiLogRoute, async (c) => {
  try {
    const { type } = c.req.param();

    const result = new ResultListGenericVM();

    result.items = await getMiLog(type);

    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    throw err;
  }
});

export default app;