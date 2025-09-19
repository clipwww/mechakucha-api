import { OpenAPIHono } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import { lruCache } from '../utilities/lru-cache';
import { getBiliBiliDanmaku } from '../libs/bilibili.lib';
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
    path: '/:id/danmaku',
    summary: '取得 Bilibili 影片彈幕',
    description: '根據影片 ID 取得 Bilibili 影片的彈幕資料',
    tags: ['動畫/漫畫'],
    request: {
        params: z.object({
            id: z.string().min(1).openapi({
                description: '影片 ID',
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
        const { id } = c.req.param();
        const { mode } = c.req.query();
        const result = new ResultListGenericVM();
        const key = `bilibili-danmaku-${id}`;
        const cacheItems = lruCache.get(key);
        if (cacheItems) {
            result.items = cacheItems;
        }
        else {
            const danmakuList = await getBiliBiliDanmaku(id);
            result.items = danmakuList;
            if (result.items.length) {
                lruCache.set(key, result.items);
            }
        }
        if (mode === 'download') {
            c.header('Content-disposition', `attachment; filename=bilibili-${id}.json`);
            c.header('Content-type', 'application/json');
            return c.json(result.items);
        }
        result.setResultValue(true, ResultCode.success);
        return c.json(result);
    }
    catch (err) {
        throw err;
    }
});
export default app;
