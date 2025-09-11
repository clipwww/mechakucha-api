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

// 文章項目 Schema（一般模式）
const PostItemSchema = z.object({
  id: z.string().openapi({
    description: '文章 ID',
    example: '2269359'
  }),
  title: z.string().openapi({
    description: '文章標題',
    example: 'デジモンアドベンチャー：第9話「完全体・襲来」'
  }),
  text: z.string().openapi({
    description: '文章內容',
    example: ''
  }),
  email: z.string().openapi({
    description: '電子郵件',
    example: ''
  }),
  oImg: z.string().openapi({
    description: '原始圖片網址',
    example: 'http://2cat.komica.org/~tedc21thc/live/src/1596335896226.jpg'
  }),
  sImg: z.string().openapi({
    description: '縮圖網址',
    example: 'http://2cat.komica.org/~tedc21thc/live/thumb/1596335896226s.jpg'
  }),
  name: z.string().openapi({
    description: '作者名稱',
    example: ''
  }),
  dateTime: z.string().openapi({
    description: '發文時間（原始格式）',
    example: '20/08/02(日)10:38'
  }),
  dateCreated: z.string().openapi({
    description: '發文時間（ISO 格式）',
    example: '2020-08-02T02:38:00.000Z'
  }),
  userId: z.string().openapi({
    description: '用戶 ID',
    example: 'bi4zkfzc/pu4N'
  }),
  warnText: z.string().openapi({
    description: '警告文字',
    example: 'レス 130 件省略。全て読むには返信ボタンを押してください。'
  }),
  reply: z.array(z.any()).openapi({
    description: '回覆列表',
    example: []
  }),
  url: z.string().optional().openapi({
    description: '文章網址',
    example: 'https://gaia.komica1.org/78/pixmicat.php?res=2269359'
  }),
}).openapi('PostItem');

// 文章項目 Schema（mode=all 模式）
const SimplePostItemSchema = z.object({
  id: z.string().openapi({
    description: '文章 ID',
    example: '2269359'
  }),
  title: z.string().openapi({
    description: '文章標題',
    example: 'デジモンアドベンチャー：第9話「完全体・襲来」'
  }),
  replyCount: z.number().openapi({
    description: '回覆數量',
    example: 140
  }),
  dateTime: z.string().openapi({
    description: '發文時間（原始格式）',
    example: '20/08/02(日)10:38'
  }),
  dateCreated: z.string().openapi({
    description: '發文時間（ISO 格式）',
    example: '2020-08-02T02:38:00.000Z'
  }),
  dateUpdated: z.string().optional().openapi({
    description: '最後更新時間',
    example: '2020-08-02T02:38:00.000Z'
  }),
  url: z.string().optional().openapi({
    description: '文章網址',
    example: 'https://gaia.komica1.org/78/pixmicat.php?res=2269359'
  }),
}).openapi('SimplePostItem');

// 看板資訊 Schema
const BoardInfoSchema = z.object({
  title: z.string().openapi({
    description: '看板標題',
    example: '二次元新番實況＠２ＣＡＴ'
  }),
  url: z.string().openapi({
    description: '看板網址',
    example: 'http://2cat.komica.org/~tedc21thc/live/pixmicat.php'
  }),
}).openapi('BoardInfo');

// 分頁資訊 Schema
const PaginationSchema = z.array(z.string()).openapi({
  description: '分頁連結列表',
  example: [
    '1.htm?',
    '2.htm?',
    '3.htm?',
    '4.htm?',
    'pixmicat.php?page_num=5',
    'pixmicat.php?page_num=6',
    'pixmicat.php?page_num=7'
  ]
});

const BoardListResponseSchema = z.object({
  success: z.boolean().openapi({
    description: '是否成功',
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
  items: z.array(z.union([PostItemSchema, SimplePostItemSchema])).openapi({
    description: '文章列表'
  }),
  item: BoardInfoSchema.optional().openapi({
    description: '看板資訊（mode=all 時回傳）'
  }),
  pages: PaginationSchema.optional().openapi({
    description: '分頁資訊'
  }),
}).openapi('BoardListResponse');

const PostDetailsResponseSchema = z.object({
  success: z.boolean().openapi({
    description: '是否成功',
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
  item: PostItemSchema.openapi({
    description: '文章詳細資訊'
  }),
}).openapi('PostDetailsResponse');

// OpenAPI routes
const boardListRoute = createRoute({
  method: 'get',
  path: '/:board',
  summary: '取得看板文章列表',
  description: '根據看板名稱取得文章列表，可分頁和選擇模式。支援 live（新番實況）和 new（新番捏他）看板。',
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
  description: '根據看板名稱和文章 ID 取得詳細資訊，包含所有回覆內容',
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
        const { posts } = await getPostListResult(board, +p);
        result.items = posts;
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