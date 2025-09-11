import { OpenAPIHono } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import { z } from 'zod';

import { lruCache } from '../utilities/lru-cache';
import { getBahumutDanmaku } from '../libs/bahamut.lib';
import { ResultCode, ResultListGenericVM, ResultGenericVM } from '../view-models/result.vm';

const app = new OpenAPIHono();

// Zod schemas
const DanmakuQuerySchema = z.object({
  mode: z.string().optional().openapi({
    description: '模式，可選 download 用於下載 JSON',
    example: 'download'
  }),
});

const DanmakuResponseSchema = z.union([
  z.object({
    success: z.boolean(),
    resultCode: z.string(),
    resultMessage: z.string(),
    items: z.array(z.any()),
  }),
  z.array(z.any())
]).openapi('DanmakuResponse');

// OpenAPI route
const danmakuRoute = createRoute({
  method: 'get',
  path: '/:sn/danmaku',
  summary: '取得巴哈姆特動畫彈幕',
  description: '根據動畫 SN 編號取得彈幕資料',
  tags: ['動畫/漫畫'],
  request: {
    params: z.object({
      sn: z.string().min(1).openapi({
        description: '動畫 SN 編號',
        example: '12345'
      }),
    }),
    query: DanmakuQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: DanmakuResponseSchema,
        },
      },
      description: '成功取得彈幕資料',
    },
  },
});

// 註冊路由
app.openapi(danmakuRoute, async (c) => {
  try {
    const { sn } = c.req.param();
    const { mode } = c.req.query();

    const result = new ResultListGenericVM();
    const key = `bahamut-danmaku-${sn}`;
    const cacheItems = lruCache.get(key) as any[];

    if (cacheItems) {
      result.items = cacheItems
    } else {
      const danmakuList = await getBahumutDanmaku(sn);
      result.items = danmakuList;
      if (result.items.length) {
        lruCache.set(key, result.items)
      }
    }

    if (mode === 'download') {
      c.header('Content-disposition', `attachment; filename=bahamut-${sn}.json`);
      c.header('Content-type', 'application/json');
      return c.json(result.items);
    }

    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    throw err;
  }
});

export default app;