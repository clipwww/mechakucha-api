import { OpenAPIHono } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import { z } from 'zod';

import { lruCache } from '../utilities/lru-cache';
import { axiosInstance } from '../utilities';
import { m3u8toStream } from '../libs/convert.lib';
import { getBangumiList, getBangumiEpisode, getBangumiPlayerById } from '../libs/anime1.lib';
import { ResultCode, ResultListGenericVM } from '../view-models/result.vm';

const app = new OpenAPIHono();

// Zod schemas
const BangumiListResponseSchema = z.object({
  success: z.boolean(),
  resultCode: z.string(),
  resultMessage: z.string(),
  items: z.array(z.any()),
}).openapi('BangumiListResponse');

const BangumiEpisodeResponseSchema = z.object({
  success: z.boolean(),
  resultCode: z.string(),
  resultMessage: z.string(),
  items: z.array(z.any()),
  item: z.object({
    id: z.string(),
    title: z.string(),
  }),
}).openapi('BangumiEpisodeResponse');

const DownloadQuerySchema = z.object({
  name: z.string().optional().openapi({
    description: '下載檔案名稱',
    example: 'episode1.mp4'
  }),
});

// OpenAPI routes
const listRoute = createRoute({
  method: 'get',
  path: '/',
  summary: '取得 Anime1 番劇列表',
  description: '取得 Anime1.me 上的所有番劇列表',
  tags: ['動畫/漫畫'],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: BangumiListResponseSchema,
        },
      },
      description: '成功取得番劇列表',
    },
  },
});

const episodeRoute = createRoute({
  method: 'get',
  path: '/:id',
  summary: '取得番劇集數',
  description: '根據番劇 ID 取得該番劇的所有集數資訊',
  tags: ['動畫/漫畫'],
  request: {
    params: z.object({
      id: z.string().min(1).openapi({
        description: '番劇 ID',
        example: '12345'
      }),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: BangumiEpisodeResponseSchema,
        },
      },
      description: '成功取得番劇集數',
    },
  },
});

const downloadRoute = createRoute({
  method: 'get',
  path: '/video/:id/download',
  summary: '下載番劇影片',
  description: '根據影片 ID 下載番劇影片檔案',
  tags: ['動畫/漫畫'],
  request: {
    params: z.object({
      id: z.string().min(1).openapi({
        description: '影片 ID',
        example: '67890'
      }),
    }),
    query: DownloadQuerySchema,
  },
  responses: {
    200: {
      description: '影片下載中',
    },
  },
});

// 註冊路由
app.openapi(listRoute, async (c) => {
  try {
    const result = new ResultListGenericVM();

    const key = `anime1-list`;
    const cacheItems = lruCache.get(key) as any[];
    if (cacheItems) {
      result.items = cacheItems
    } else {
      result.items = await getBangumiList();
      lruCache.set(key, result.items)
    }

    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    throw err;
  }
});

app.openapi(episodeRoute, async (c) => {
  try {
    const { id } = c.req.param();
    const result = new ResultListGenericVM();

    const key = `anime1-${id}`;
    const cacheValue = lruCache.get(key) as any[];

    if (cacheValue) {
      // @ts-ignore
      const { item, items } = cacheValue;
      result.item = item;
      result.items = items;
    } else {
      const { title, items } = await getBangumiEpisode(id);
      result.items = items;
      result.item = {
        id,
        title
      }
      lruCache.set(key, {
        items: result.items,
        item: result.item
      })
    }

    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    throw err;
  }
});

app.openapi(downloadRoute, async (c) => {
  const { id } = c.req.param();
  const { name } = c.req.query();

  const { type, url, setCookies } = await getBangumiPlayerById(id as string);

  if (!url) {
    throw new Error('URL Not Found.');
  }

  c.header('Content-disposition', `attachment; filename=${name ? encodeURIComponent(name as string) : id}.mp4`);
  c.header('Content-type', 'video/mp4');

  // 臨時：返回簡單響應，稍後改進流處理
  return c.text('Video download in progress...', 200);
});

export default app;