import { OpenAPIHono } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import webPush from 'web-push';
import { ResultCode, ResultGenericVM } from '../view-models/result.vm';
const app = new OpenAPIHono();
// Zod schemas for API documentation
const WebPushTokenSchema = z.object({
    endpoint: z.string().openapi({
        example: 'https://fcm.googleapis.com/fcm/send/...',
        description: 'Push service endpoint URL'
    }),
    keys: z.object({
        p256dh: z.string().openapi({
            example: 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8nJy',
            description: 'P256DH key for encryption'
        }),
        auth: z.string().openapi({
            example: 'k8pVjhjLP8YwCLv4c3q8Ew',
            description: 'Auth key for encryption'
        })
    }).openapi('WebPushKeys')
}).openapi('WebPushToken');
const WebPushNotificationQuerySchema = z.object({
    title: z.string().optional().openapi({
        example: '測試通知',
        description: '通知標題'
    }),
    body: z.string().optional().openapi({
        example: '這是一條測試訊息',
        description: '通知內容'
    }),
    url: z.string().optional().openapi({
        example: 'https://example.com',
        description: '點擊通知時開啟的 URL'
    })
}).openapi('WebPushNotificationQuery');
const ApiResponseSchema = z.object({
    success: z.boolean().openapi({ example: true }),
    resultCode: z.string().openapi({ example: '200' }),
    resultMessage: z.string().openapi({ example: '' }),
    item: z.any().optional(),
}).openapi('ApiResponse');
// Routes with OpenAPI documentation
const registerTokenRoute = createRoute({
    method: 'post',
    path: '/',
    summary: '註冊 Web Push Token',
    description: '註冊用戶的 Web Push 通知 token',
    tags: ['工具服務'],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: WebPushTokenSchema
                }
            }
        }
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: ApiResponseSchema
                }
            },
            description: 'Token 註冊成功'
        }
    }
});
const sendNotificationRoute = createRoute({
    method: 'get',
    path: '/',
    summary: '發送 Web Push 通知',
    description: '向所有已註冊的用戶發送 Web Push 通知',
    tags: ['工具服務'],
    request: {
        query: WebPushNotificationQuerySchema
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: ApiResponseSchema
                }
            },
            description: '通知發送成功'
        }
    }
});
const tokens = [];
webPush.setVapidDetails('mailto:clipwww@gmail.com', `${process.env.WEB_PUSH_PUBLIC_KEY}`, `${process.env.WEB_PUSH_PRIVATE_KEY}`);
app.openapi(registerTokenRoute, async (c) => {
    try {
        const result = new ResultGenericVM();
        const body = await c.req.json();
        if (!body) {
            throw new Error('paramaters is empty.');
        }
        tokens.push(body);
        result.setResultValue(true, ResultCode.success);
        return c.json(result);
    }
    catch (err) {
        throw err;
    }
});
app.openapi(sendNotificationRoute, async (c) => {
    try {
        const result = new ResultGenericVM();
        const { title, body, url } = c.req.query();
        const sendData = {
            title: title || '安安你好幾歲住哪',
            body: body || '這只是條測試訊息。',
            data: {
                url: url || 'https://clipwww.github.io/blog'
            },
            icon: 'https://clipwww.github.io/blog/favicon.ico',
            // badge: '',
        };
        console.log(tokens);
        const promiseArr = [];
        for (let token of tokens) {
            promiseArr.push(webPush.sendNotification(token, JSON.stringify(sendData)));
        }
        await Promise.all(promiseArr);
        result.setResultValue(true, ResultCode.success);
        return c.json(result);
    }
    catch (err) {
        throw err;
    }
});
export default app;
