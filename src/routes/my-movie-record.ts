import { OpenAPIHono } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import { z } from 'zod';

import { ResultCode, ResultListGenericVM } from '../view-models/result.vm';
import { getMovieLog } from '../libs/google-sheets.lib';

const app = new OpenAPIHono();

// Zod schemas
const MovieRecordSchema = z.object({
  id: z.string().openapi({
    description: '唯一標識符（Base64編碼）',
    example: 'MjAyNS84Lzgg5LiL5Y2IIDIxOjQwOjAw...'
  }),
  memo: z.string().openapi({
    description: '備註',
    example: ''
  }),
  date: z.string().openapi({
    description: '觀影日期時間（ISO格式）',
    example: '2025-08-08T13:40:00.000Z'
  }),
  title: z.string().openapi({
    description: '片名',
    example: '劇場版「鬼滅之刃」無限城篇 第一章 猗窩座再襲'
  }),
  area: z.string().openapi({
    description: '國別',
    example: '日本'
  }),
  version: z.string().openapi({
    description: '版本',
    example: '2D'
  }),
  theater: z.string().openapi({
    description: '影城',
    example: '林口威秀'
  }),
  price: z.number().openapi({
    description: '票價',
    example: 240
  }),
  fee: z.number().openapi({
    description: '手續費',
    example: 20
  }),
  tickets: z.number().openapi({
    description: '張數',
    example: 1
  }),
  discount: z.number().openapi({
    description: '折扣',
    example: 0
  }),
  cost: z.number().openapi({
    description: '總花費',
    example: 260
  }),
}).openapi('MovieRecord');

const MovieRecordListResponseSchema = z.object({
  success: z.boolean(),
  resultCode: z.string(),
  resultMessage: z.string(),
  items: z.array(MovieRecordSchema),
}).openapi('MovieRecordListResponse');

// OpenAPI route
const getMovieRecordsRoute = createRoute({
  method: 'get',
  path: '/',
  summary: '取得個人電影記錄',
  description: '取得個人的電影觀看記錄列表',
  tags: ['影視娛樂'],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: MovieRecordListResponseSchema,
        },
      },
      description: '成功取得電影記錄',
    },
  },
});

// 註冊路由
app.openapi(getMovieRecordsRoute, async (c) => {
  try {
    const result = new ResultListGenericVM<any>();

    result.items = await getMovieLog();

    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    throw err;
  }
});

export default app;