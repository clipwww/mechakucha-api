import { OpenAPIHono } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import { ResultCode, ResultListGenericVM } from '../view-models/result.vm';
import { getMovieLog, getMiLog } from '../libs/google-sheets.lib';
const app = new OpenAPIHono();
// Zod schemas
const MovieLogSchema = z.object({
    id: z.string().openapi({
        description: '唯一標識符（Base64編碼）',
        example: 'MjAyNS84Lzgg5LiL5Y2IIDIxOjQwOjAwLOWKh+WgtOeJiOOAjOmsvOa7heS5i+WIg+OAjeeEoemZkOWfjuevhyDnrKzkuIDnq6Ag54yX56qp5bqn5YaN6KWyLOaXpeacrCwyRCzmnpflj6PlqIHnp4AsMjQwLDIwLDEsMCwyNjA='
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
}).openapi('MovieLog');
const MiLogSchema = z.object({
    id: z.string().openapi({
        description: '唯一標識符（Base64編碼）',
        example: 'MjAyNS84Lzgg5LiL5Y2IIDIxOjQwOjAwLOWKh+WgtOeJiOOAjOmsvOa7heS5i+WIg+OAjeeEoemZkOWfjuevhyDnrKzkuIDnq6Ag54yX56qp5bqn5YaN6KWyLOaXpeacrCwyRCzmnpflj6PlqIHnp4AsMjQwLDIwLDEsMCwyNjA='
    }),
    date: z.string().optional().openapi({
        description: '記錄日期時間（ISO格式）',
        example: '2024-01-15T10:30:00.000Z'
    }),
    type: z.string().optional().openapi({
        description: '記錄類型',
        example: 'sport'
    }),
    value: z.union([z.string(), z.number()]).optional().openapi({
        description: '記錄值',
        example: '跑步 5km'
    }),
    notes: z.union([z.string(), z.number()]).optional().openapi({
        description: '備註',
        example: '晨跑'
    }),
    startTime: z.string().optional().openapi({
        description: '開始時間（ISO格式）',
        example: '2024-01-15T06:00:00.000Z'
    }),
    lastSyncTime: z.string().optional().openapi({
        description: '最後同步時間（ISO格式）',
        example: '2024-01-15T07:30:00.000Z'
    }),
    start: z.string().optional().openapi({
        description: '開始時間戳（ISO格式）',
        example: '2024-01-15T06:00:00.000Z'
    }),
    stop: z.string().optional().openapi({
        description: '結束時間戳（ISO格式）',
        example: '2024-01-15T07:30:00.000Z'
    }),
}).openapi('MiLog');
const LogListResponseSchema = z.object({
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
    items: z.array(z.union([MovieLogSchema, MiLogSchema])).openapi({
        description: '日誌項目列表'
    }),
}).openapi('LogListResponse');
// OpenAPI routes
const getMovieLogRoute = createRoute({
    method: 'get',
    path: '/movie',
    summary: '取得電影觀看記錄',
    description: '從 Google Sheets 取得所有電影觀看記錄，包含觀影詳情和費用資訊',
    tags: ['我的 Log'],
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: LogListResponseSchema,
                },
            },
            description: '成功取得電影觀看記錄列表',
        },
    },
});
const getMiLogRoute = createRoute({
    method: 'get',
    path: '/mi/:type',
    summary: '取得個人記錄',
    description: '根據類型從 Google Sheets 取得個人記錄（運動、睡眠、活動等）',
    tags: ['我的 Log'],
    request: {
        params: z.object({
            type: z.enum(['sport', 'sleep', 'activity']).openapi({
                description: '記錄類型',
                example: 'sport'
            }),
        }),
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: LogListResponseSchema,
                },
            },
            description: '成功取得個人記錄列表',
        },
    },
});
// 註冊路由
app.openapi(getMovieLogRoute, async (c) => {
    try {
        const result = new ResultListGenericVM();
        result.items = await getMovieLog();
        result.setResultValue(true, ResultCode.success);
        return c.json(result);
    }
    catch (err) {
        throw err;
    }
});
app.openapi(getMiLogRoute, async (c) => {
    try {
        const { type } = c.req.param();
        const result = new ResultListGenericVM();
        result.items = await getMiLog(type);
        result.setResultValue(true, ResultCode.success);
        return c.json(result);
    }
    catch (err) {
        throw err;
    }
});
export default app;
