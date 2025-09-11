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

// 巴哈姆特彈幕 Schema
const BahamutDanmakuSchema = z.object({
  text: z.string().openapi({
    description: '彈幕文字內容',
    example: '我來啦'
  }),
  color: z.string().openapi({
    description: '彈幕顏色（十六進制）',
    example: '#FFFFFF'
  }),
  size: z.number().openapi({
    description: '彈幕文字大小',
    example: 1
  }),
  position: z.number().openapi({
    description: '彈幕位置（0=右到左, 1=頂部, 2=底部）',
    example: 0
  }),
  time: z.number().openapi({
    description: '彈幕出現時間（秒）',
    example: 8.2
  }),
  sn: z.number().openapi({
    description: '動畫 SN 編號',
    example: 9753573
  }),
  userid: z.string().openapi({
    description: '發送彈幕的用戶 ID',
    example: 'amy10856'
  }),
  mode: z.string().openapi({
    description: '彈幕顯示模式（rtl=右到左, top=頂部, bottom=底部）',
    example: 'rtl'
  }),
  digital_time: z.string().openapi({
    description: '數位時間格式（HH:mm:ss）',
    example: '00:00:08'
  }),
}).openapi('BahamutDanmaku');

// 響應 Schema
const DanmakuResponseSchema = z.union([
  z.object({
    success: z.boolean().openapi({
      description: '操作是否成功',
      example: true
    }),
    resultCode: z.string().openapi({
      description: '結果代碼',
      example: '200'
    }),
    resultMessage: z.string().openapi({
      description: '結果訊息',
      example: ''
    }),
    items: z.array(BahamutDanmakuSchema).openapi({
      description: '彈幕數據列表'
    }),
  }),
  z.array(BahamutDanmakuSchema).openapi({
    description: '彈幕數據列表（下載模式）'
  })
]).openapi('DanmakuResponse');

// OpenAPI route
const danmakuRoute = createRoute({
  method: 'get',
  path: '/:sn/danmaku',
  summary: '取得巴哈姆特動畫彈幕',
  description: '根據動畫 SN 編號取得巴哈姆特動畫瘋的彈幕資料。支援一般查詢和 JSON 下載模式',
  tags: ['動畫/漫畫'],
  request: {
    params: z.object({
      sn: z.string().min(1).openapi({
        description: '動畫 SN 編號',
        example: '9753573'
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