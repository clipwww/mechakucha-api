import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { createRoute, OpenAPIHono } from '@hono/zod-openapi';

import { lruCache } from '../utilities/lru-cache';
import { getAnimeList, getAnimeDetails, getAnimeVideo, queryAnimeList, getAnimeUpdate } from '../libs/agefans.lib';
import { ResultCode, ResultListGenericVM, ResultGenericVM } from '../view-models/result.vm';

const app = new OpenAPIHono();

// Zod schemas
const querySchema = z.object({
  keyword: z.string().optional().openapi({
    description: '搜尋關鍵字',
    example: '進擊的巨人'
  }),
  mode: z.string().optional().openapi({
    description: '模式，可選 update',
    example: 'update'
  }),
});

const paramSchema = z.object({
  id: z.string(),
  pId: z.string().optional(),
  eId: z.string().optional(),
});

// Response schemas
const AnimeListResponseSchema = z.object({
  success: z.boolean(),
  resultCode: z.string(),
  resultMessage: z.string(),
  items: z.array(z.any()),
}).openapi('AnimeListResponse');

const AnimeDetailsResponseSchema = z.object({
  success: z.boolean(),
  resultCode: z.string(),
  resultMessage: z.string(),
  item: z.any(),
}).openapi('AnimeDetailsResponse');

// OpenAPI routes
const listRoute = createRoute({
  method: 'get',
  path: '/',
  summary: '取得番劇列表',
  description: '取得 AGE 動漫番劇列表，可依關鍵字搜尋或取得最新更新',
  tags: ['動畫/漫畫'],
  request: {
    query: querySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: AnimeListResponseSchema,
        },
      },
      description: '成功取得番劇列表',
    },
  },
});

const detailsRoute = createRoute({
  method: 'get',
  path: '/:id',
  summary: '取得番劇詳細資訊',
  description: '根據番劇 ID 取得詳細資訊',
  tags: ['動畫/漫畫'],
  request: {
    params: z.object({
      id: z.string().min(1).openapi({
        description: '番劇 ID',
        example: '20190119'
      }),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: AnimeDetailsResponseSchema,
        },
      },
      description: '成功取得番劇詳細資訊',
    },
  },
});

const videoRoute = createRoute({
  method: 'get',
  path: '/:id/:pId/:eId',
  summary: '取得番劇影片',
  description: '根據番劇 ID、播放 ID 和集數 ID 取得影片播放連結',
  tags: ['動畫/漫畫'],
  request: {
    params: z.object({
      id: z.string().min(1).openapi({
        description: '番劇 ID',
        example: '20190119'
      }),
      pId: z.string().min(1).openapi({
        description: '播放 ID',
        example: '12345'
      }),
      eId: z.string().min(1).openapi({
        description: '集數 ID',
        example: '1'
      }),
    }),
  },
  responses: {
    302: {
      description: '重定向到影片播放連結',
    },
  },
});

// 註冊路由
app.openapi(listRoute, async (c) => {
  try {
    const { keyword, mode = '' } = c.req.valid('query');

    const result = new ResultListGenericVM();

    const key = `agefans-list-${keyword}-${mode}`;
    const cacheItems = lruCache.get(key) as any[];
    if (cacheItems) {
      result.items = cacheItems
    } else {
      if (mode === 'update') {
        result.items = await getAnimeUpdate();
      } else {
        result.items = keyword ? await queryAnimeList(keyword as string) : await getAnimeList();
      }

      lruCache.set(key, result.items)
    }

    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    throw err;
  }
});

app.openapi(detailsRoute, async (c) => {
  try {
    const { id } = c.req.param();
    const result = new ResultGenericVM();

    const key = `agefans-details-${id}`;
    const cacheItem = lruCache.get(key);

    if (cacheItem) {
      result.item = cacheItem;
    } else {
      result.item = await getAnimeDetails(id);
      lruCache.set(key, result.item)
    }

    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    throw err;
  }
});

app.openapi(videoRoute, async (c) => {
  const { id, pId, eId } = c.req.param();

  const key = `agefans-video-${id}-${pId}-${eId}`;
  const cacheVideoUrl = lruCache.get(key) as string;

  const videoUrl = cacheVideoUrl || await getAnimeVideo(id, pId, eId);
  if (videoUrl) {
    lruCache.set(key, videoUrl)
  }

  return c.redirect(videoUrl);
});

export default app;