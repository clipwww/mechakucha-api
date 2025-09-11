import { OpenAPIHono } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import { z } from 'zod';

import { getAllPostList, getPostDetails, getPostListResult } from '../libs/komica.lib';
import { ResultCode, ResultListGenericVM, ResultGenericVM } from '../view-models/result.vm';

const app = new OpenAPIHono();

// Zod schemas
const BoardQuerySchema = z.object({
  p: z.string().optional().openapi({
    description: '頁數',
    example: '1'
  }),
  mode: z.string().optional().openapi({
    description: '模式，可選 all 顯示所有文章',
    example: 'all'
  }),
});

const BoardListResponseSchema = z.object({
  success: z.boolean(),
  resultCode: z.string(),
  resultMessage: z.string(),
  items: z.array(z.any()),
  item: z.any().optional(),
  pages: z.array(z.string()).optional(),
}).openapi('BoardListResponse');

const PostDetailsResponseSchema = z.object({
  success: z.boolean(),
  resultCode: z.string(),
  resultMessage: z.string(),
  item: z.any(),
}).openapi('PostDetailsResponse');

// OpenAPI routes
const boardListRoute = createRoute({
  method: 'get',
  path: '/:board',
  summary: '取得看板文章列表',
  description: '根據看板名稱取得文章列表，可分頁和選擇模式',
  tags: ['K島'],
  request: {
    params: z.object({
      board: z.string().min(1).openapi({
        description: '看板名稱，如 live 或 new',
        example: 'live'
      }),
    }),
    query: BoardQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: BoardListResponseSchema,
        },
      },
      description: '成功取得文章列表',
    },
  },
});

const postDetailsRoute = createRoute({
  method: 'get',
  path: '/:board/:id',
  summary: '取得文章詳細資訊',
  description: '根據看板名稱和文章 ID 取得詳細資訊',
  tags: ['K島'],
  request: {
    params: z.object({
      board: z.string().min(1).openapi({
        description: '看板名稱',
        example: 'live'
      }),
      id: z.string().min(1).openapi({
        description: '文章 ID',
        example: '2269359'
      }),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: PostDetailsResponseSchema,
        },
      },
      description: '成功取得文章詳細資訊',
    },
  },
});

/**
 * @api {get} /komica/:board/?p=1&mode= 取得看板文章列表
 * @apiName GetKomicaPosts
 * @apiGroup 糟糕島
 * @apiVersion 1.0.0
 *
 * @apiParam {String} board 看板:`live` 新番實況、`new` 新番捏他
 * @apiParam {Number} p=1 頁數
 * @apiParam {String} mode=null 模式: `all`顯示所有文章
 *
 * @apiSuccessExample Success Response
{
  "success": true,
  "resultCode": "200",
  "resultMessage": "",
  "items": [
    {
      "id": "2269359",
      "title": "デジモンアドベンチャー：第9話「完全体・襲来」",
      "text": "",
      "email": "",
      "oImg": "http://2cat.komica.org/~tedc21thc/live/src/1596335896226.jpg",
      "sImg": "http://2cat.komica.org/~tedc21thc/live/thumb/1596335896226s.jpg",
      "name": "",
      "dateTime": "20/08/02(日)10:38",
      "dateCreated": "2020-08-02T02:38:00.000Z",
      "userId": "bi4zkfzc/pu4N",
      "warnText": "レス 130 件省略。全て読むには返信ボタンを押してください。",
      "reply": []
    }
  ],
  "pages": [
    "1.htm?",
    "2.htm?",
    "3.htm?",
    "4.htm?",
    "pixmicat.php?page_num=5",
    "pixmicat.php?page_num=6",
    "pixmicat.php?page_num=7"
  ]
}
 *
 * @apiSuccessExample mode=all
{
  "success": true,
  "resultCode": "200",
  "resultMessage": "",
  "items": [
    {
      "id": "2269359",
      "title": "デジモンアドベンチャー：第9話「完全体・襲来」",
      "replyCount": "140",
      "dateTime": "20/08/02(日)10:38",
      "dateCreated": "2020-08-02T02:38:00.000Z"
    },
  ],
  "item": {
    "title": "二次元新番實況＠２ＣＡＴ",
    "url": "http://2cat.komica.org/~tedc21thc/live/pixmicat.php"
  }
}
 */
// 註冊路由
app.openapi(boardListRoute, async (c) => {
  try {
    const { board } = c.req.param();
    const { p = 1, mode = '' } = c.req.query()

    const result = new ResultListGenericVM();

    switch (mode) {
      case 'all':
        {
          const { title, url, posts } = await getAllPostList(board);
          result.items = posts;
          result.item = {
            title,
            url,
          }
        }
        break;
      default:
        const { posts, pages } = await getPostListResult(board, +p);
        result.items = posts;
        result['pages'] = pages;
    }

    result.setResultValue(true, ResultCode.success)

    return c.json(result);
  } catch (err) {
    throw err;
  }
});

app.openapi(postDetailsRoute, async (c) => {
  try {
    const { board, id } = c.req.param();

    const result = new ResultGenericVM();
    const { post, url } = await getPostDetails(board, id);
    result.item = {
      ...post,
      url
    }

    result.setResultValue(true, ResultCode.success)

    return c.json(result);
  } catch (err) {
    throw err;
  }
});

export default app;