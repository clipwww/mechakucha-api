import { OpenAPIHono } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import { z } from 'zod';

import { lruCache } from '../utilities/lru-cache';
import { getNicoNicoDanmaku, getRankingList } from '../libs/niconico.lib';
import { ResultCode, ResultListGenericVM, ResultGenericVM } from '../view-models/result.vm';

const app = new OpenAPIHono();

// Zod schemas
const DanmakuQuerySchema = z.object({
  mode: z.string().optional().openapi({
    description: '模式，可選 download 用於下載 JSON',
    example: 'download'
  }),
});

const RankingQuerySchema = z.object({
  type: z.string().optional().openapi({
    description: '排行類型',
    example: 'all'
  }),
  term: z.string().optional().openapi({
    description: '排行時間',
    example: '24h'
  }),
});

const NicoNicoDanmakuSchema = z.object({
  text: z.string().openapi({ example: 'ガルパン最終章おめでとう！' }),
  time: z.number().openapi({ example: 0.78 }),
  color: z.string().openapi({ example: '#ffffff' }),
  mode: z.string().openapi({ example: 'BOTTOM' }),
  size: z.number().openapi({ example: 36 }),
  id: z.number().openapi({ example: 19135 }),
  user_id: z.string().openapi({ example: 'RLmRNQvcNNzRDZd1IV4HMg5OJlQ' }),
  date: z.number().openapi({ example: 1472384190 }),
  date_iso_string: z.string().openapi({ example: '2016-08-28T11:36:30.000Z' }),
}).openapi('NicoNicoDanmaku');

const NicoNicoRankingSchema = z.object({
  title: z.string().openapi({ example: '第1位：ウマ娘 プリティーダービー Season 2 第1話「トウカイテイオー」' }),
  link: z.string().openapi({ example: 'https://www.nicovideo.jp/watch/so38015385?ref=rss_specified_ranking_rss2' }),
  pubDate: z.string().openapi({ example: '2021-01-06T09:13:26.000Z' }),
  description: z.string().openapi({ example: '動画一覧はこちらシンボリルドルフに憧れて無敗の三冠を目指すトウカイテイオーは、次走の日本ダービーを目' }),
  id: z.string().openapi({ example: 'so38015385' }),
  originDescription: z.string().openapi({ example: '<p class="nico-thumbnail"><img alt="ウマ娘 プリティーダービー Season 2 第1話「トウカイテイオー」" src="https://nicovideo.cdn.nimg.jp/thumbnails/38015385/38015385.87708699" width="94" height="70" border="0"/></p>' }),
  memo: z.string().openapi({ example: '' }),
  timeLength: z.string().openapi({ example: '23:55' }),
  nicoInfoDate: z.string().openapi({ example: '2021年01月05日 12：00：00' }),
  totalView: z.number().openapi({ example: 82257 }),
  commentCount: z.number().openapi({ example: 12268 }),
  mylistCount: z.number().openapi({ example: 413 }),
  thumbnailSrc: z.string().openapi({ example: 'https://nicovideo.cdn.nimg.jp/thumbnails/38015385/38015385.87708699' }),
}).openapi('NicoNicoRanking');

const DanmakuResponseSchema = z.union([
  z.object({
    success: z.boolean(),
    resultCode: z.string(),
    resultMessage: z.string(),
    items: z.array(NicoNicoDanmakuSchema),
  }),
  z.array(NicoNicoDanmakuSchema)
]).openapi('DanmakuResponse');

const RankingResponseSchema = z.object({
  success: z.boolean(),
  resultCode: z.string(),
  resultMessage: z.string(),
  items: z.array(NicoNicoRankingSchema),
}).openapi('RankingResponse');

// OpenAPI routes
const danmakuRoute = createRoute({
  method: 'get',
  path: '/:id/danmaku',
  summary: '取得 NicoNico 動畫彈幕',
  description: '根據動畫 ID 取得 NicoNico 動畫的彈幕資料',
  tags: ['動畫/漫畫'],
  request: {
    params: z.object({
      id: z.string().min(1).openapi({
        description: '動畫 ID',
        example: 'so38015385'
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

const rankingRoute = createRoute({
  method: 'get',
  path: '/ranking',
  summary: '取得 NicoNico 排行榜',
  description: '取得 NicoNico 動畫的排行榜資料',
  tags: ['動畫/漫畫'],
  request: {
    query: RankingQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: RankingResponseSchema,
        },
      },
      description: '成功取得排行榜資料',
    },
  },
});

// 註冊路由
app.openapi(danmakuRoute, async (c) => {
  try {
    const { id } = c.req.param();
    const { mode } = c.req.query();

    const result = new ResultListGenericVM();
    const key = `niconico-danmaku-${id}`;
    const cacheItems = lruCache.get(key) as any[];

    if (cacheItems) {
      result.items = cacheItems
    } else {
      const danmakuList = await getNicoNicoDanmaku(id);
      result.items = danmakuList;
      if (result.items.length) {
        lruCache.set(key, result.items)
      }
    }

    if (mode === 'download') {
      c.header('Content-disposition', `attachment; filename=niconico-${id}.json`);
      c.header('Content-type', 'application/json');
      return c.json(result.items);
    }

    result.setResultValue(true, ResultCode.success)

    return c.json(result);
  } catch (err) {
    throw err;
  }
});

app.openapi(rankingRoute, async (c) => {
  try {
    const { type, term } = c.req.query();

    const result = new ResultListGenericVM();
    const key = `niconico-ranking-${type}-${term}`;
    const cacheItems = lruCache.get(key) as any[];

    if (cacheItems) {
      result.items = cacheItems
    } else {
      const rankingList = await getRankingList(type as string, term as string);
      result.items = rankingList;
      if (result.items.length) {
        lruCache.set(key, result.items)
      }
    }
    result.setResultValue(true, ResultCode.success)

    return c.json(result);
  } catch (err) {
    throw err;
  }
});

export default app;