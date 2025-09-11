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
  keyword: z.string().optional(),
  mode: z.string().optional(),
});

const paramSchema = z.object({
  id: z.string(),
  pId: z.string().optional(),
  eId: z.string().optional(),
});

/**
 * @api {get} /agefans?keyword 取得番劇列表
 * @apiName GetAnimeList
 * @apiGroup AGE動漫
 * @apiVersion 1.0.0
 *
 * @apiParam {String} keyword 搜尋關鍵字
 *
 *
 * @apiSuccessExample Success Response
{
  "success": true,
  "resultCode": "200",
  "resultMessage": "",
  "items": [
    {
      "isnew": false,
      "id": "20190119",
      "wd": 1,
      "name": "公主連結！Re:Dive",
      "mtime": "2020-06-29 23:03:52",
      "namefornew": "第13話(完結)"
    }
  ]
}
 * @apiSuccessExample Success Response With Keyword
{
  "success": true,
  "resultCode": "200",
  "resultMessage": "",
  "items": [
    {
      "id": "20130023",
      "title": "進擊的巨人",
      "imgUrl": "https:////sc02.alicdn.com/kf/H1deba4ea3529412dbe9031f5cfad0bd00.jpg",
      "type": "TV",
      "originName": "進撃の巨人",
      "studio": "WIT STUDIO",
      "dateAired": "2013-04-07",
      "status": "完結",
      "tags": [
        "熱血",
        "懸疑",
        "奇幻",
        "劇情"
      ],
      "description": "電視動畫《進擊的巨人》改編自諫山創原作的同名漫畫，由WIT STUDIO負責制作。\n巨人支配著的世界。變成巨人的食物的人類建造起了高達50米的巨大牆壁、以自由為代價去防止牆外的巨人的侵略...。\n10歲的少年艾倫·耶格爾對牆外的世界充滿了好奇。艾倫滿足於牆內暫時和平的生活，而牆外歸來的人們卻充滿了絕望，與牆內的氛圍格格不入。艾倫把他們稱之為「家畜」，並認為這些人是「異物」。\n然而，能夠越過牆壁的超大型巨人出現了，艾倫的「夢」以及人們的「和平」瞬間土崩瓦解……"
    }
  ]
}
 * 
 */
// OpenAPI route
const route = createRoute({
  method: 'get',
  path: '/',
  request: {
    query: querySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            resultCode: z.string(),
            resultMessage: z.string(),
            items: z.array(z.any()),
          }),
        },
      },
      description: '取得番劇列表',
    },
  },
});

app.openapi(route, async (c) => {
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
})

app.get('/:id', async (c) => {
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
})

app.get('/:id/:pId/:eId', async (c) => {
  const { id, pId, eId } = c.req.param();

  const key = `agefans-video-${id}-${pId}-${eId}`;
  const cacheVideoUrl = lruCache.get(key) as string;

  const videoUrl = cacheVideoUrl || await getAnimeVideo(id, pId, eId);
  if (videoUrl) {
    lruCache.set(key, videoUrl)
  }

  return c.redirect(videoUrl);
})

export default app;