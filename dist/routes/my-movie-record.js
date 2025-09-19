import { OpenAPIHono } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import { ResultCode, ResultListGenericVM } from '../view-models/result.vm';
import { getMovieLog } from '../libs/google-sheets.lib';
const app = new OpenAPIHono();
// Zod schemas
const MovieRecordSchema = z.object({
    date: z.string().openapi({ example: '2024-01-15' }),
    movie: z.string().openapi({ example: '蜘蛛人：無家日' }),
    rating: z.string().optional().openapi({ example: '8.5' }),
    notes: z.string().optional().openapi({ example: '很好看' }),
}).openapi('MovieRecord');
const MovieRecordListResponseSchema = z.object({
    success: z.boolean(),
    resultCode: z.string(),
    resultMessage: z.string(),
    items: z.array(MovieRecordSchema),
}).openapi('MovieRecordListResponse');
// OpenAPI route
const getMovieRecordsRoute = createRoute({
    method: 'get',
    path: '/',
    summary: '取得個人電影記錄',
    description: '取得個人的電影觀看記錄列表',
    tags: ['影視娛樂'],
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: MovieRecordListResponseSchema,
                },
            },
            description: '成功取得電影記錄',
        },
    },
});
// 註冊路由
app.openapi(getMovieRecordsRoute, async (c) => {
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
export default app;
