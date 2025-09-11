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
    description: '模式，可選 update 取得最新更新',
    example: 'update'
  }),
});

// 番劇項目 Schema（用於列表）
const AnimeItemSchema = z.object({
  id: z.union([z.string(), z.number()]).openapi({
    description: '番劇 ID',
    example: '20190119'
  }),
  name: z.string().openapi({
    description: '番劇名稱',
    example: '進擊的巨人'
  }),
  wd: z.number().optional().openapi({
    description: '星期幾（1-7）',
    example: 7
  }),
  isnew: z.boolean().optional().openapi({
    description: '是否為新番',
    example: true
  }),
  mttime: z.union([z.string(), z.date()]).optional().openapi({
    description: '更新時間',
    example: '2024-01-15T10:30:00.000Z'
  }),
  namefornew: z.string().optional().openapi({
    description: '新番標題',
    example: '進擊的巨人第四季'
  }),
  link: z.string().optional().openapi({
    description: '詳細頁面連結',
    example: '/detail/20190119'
  }),
  imgUrl: z.string().optional().openapi({
    description: '封面圖片 URL',
    example: 'https://example.com/poster.jpg'
  }),
  description: z.string().optional().openapi({
    description: '簡介',
    example: '故事描述...'
  }),
}).openapi('AnimeItem');

// 集數 Schema
const EpisodeSchema = z.object({
  id: z.string().openapi({
    description: '集數唯一標識符',
    example: '12345_1'
  }),
  pId: z.string().openapi({
    description: '播放 ID',
    example: '12345'
  }),
  eId: z.string().openapi({
    description: '集數 ID',
    example: '1'
  }),
  href: z.string().openapi({
    description: '播放頁面連結',
    example: 'https://age.tv/play/20190119?playid=12345_1'
  }),
  title: z.string().openapi({
    description: '集數標題',
    example: '第1話 襲擊'
  }),
}).openapi('Episode');

// 番劇詳細資訊 Schema
const AnimeDetailsSchema = z.object({
  id: z.string().openapi({
    description: '番劇 ID',
    example: '20190119'
  }),
  title: z.string().openapi({
    description: '番劇標題',
    example: '進擊的巨人'
  }),
  imgUrl: z.string().openapi({
    description: '封面圖片 URL',
    example: 'https://example.com/poster.jpg'
  }),
  description: z.string().openapi({
    description: '詳細介紹',
    example: '故事詳細描述...'
  }),
  area: z.string().openapi({
    description: '地區',
    example: '日本'
  }),
  type: z.string().openapi({
    description: '動畫種類',
    example: 'TV動畫'
  }),
  originName: z.string().openapi({
    description: '原版名稱',
    example: '進撃の巨人'
  }),
  studio: z.string().openapi({
    description: '製作公司',
    example: 'WIT STUDIO'
  }),
  dateAired: z.string().openapi({
    description: '首播時間',
    example: '2013年4月'
  }),
  status: z.string().openapi({
    description: '播放狀態',
    example: '已完結'
  }),
  tags: z.array(z.string()).openapi({
    description: '標籤',
    example: ['奇幻', '動作', '黑暗']
  }),
  officialWebsite: z.string().openapi({
    description: '官方網站',
    example: 'https://example.com'
  }),
  episodeList: z.array(EpisodeSchema).openapi({
    description: '集數列表'
  }),
}).openapi('AnimeDetails');

// 搜尋結果 Schema
const SearchResultSchema = z.object({
  id: z.string().openapi({
    description: '番劇 ID',
    example: '20190119'
  }),
  title: z.string().openapi({
    description: '番劇標題',
    example: '進擊的巨人'
  }),
  imgUrl: z.string().openapi({
    description: '封面圖片 URL',
    example: 'https://example.com/poster.jpg'
  }),
  type: z.string().openapi({
    description: '動畫種類',
    example: 'TV動畫'
  }),
  originName: z.string().openapi({
    description: '原版名稱',
    example: '進撃の巨人'
  }),
  studio: z.string().openapi({
    description: '製作公司',
    example: 'WIT STUDIO'
  }),
  dateAired: z.string().openapi({
    description: '首播時間',
    example: '2013年4月'
  }),
  status: z.string().openapi({
    description: '播放狀態',
    example: '已完結'
  }),
  tags: z.array(z.string()).openapi({
    description: '標籤',
    example: ['奇幻', '動作', '黑暗']
  }),
  description: z.string().openapi({
    description: '簡介',
    example: '故事簡介...'
  }),
}).openapi('SearchResult');

// Response schemas
const AnimeListResponseSchema = z.object({
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
  items: z.array(z.union([AnimeItemSchema, SearchResultSchema])).openapi({
    description: '番劇項目列表'
  }),
}).openapi('AnimeListResponse');

const AnimeDetailsResponseSchema = z.object({
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
  item: AnimeDetailsSchema.openapi({
    description: '番劇詳細資訊'
  }),
}).openapi('AnimeDetailsResponse');

// OpenAPI routes
const listRoute = createRoute({
  method: 'get',
  path: '/',
  summary: '取得 AGE 動漫番劇列表',
  description: '取得 AGE 動漫網站的番劇列表。支援關鍵字搜尋，或使用 mode=update 取得最新更新列表',
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
  description: '根據番劇 ID 取得完整的詳細資訊，包含基本資料、製作資訊和集數列表',
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
  summary: '取得番劇影片播放連結',
  description: '根據番劇 ID、播放 ID 和集數 ID 取得影片播放連結，會重定向到實際的影片來源',
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