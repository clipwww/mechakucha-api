import { Hono } from 'hono';
import crypto from 'crypto';
import { handleMessageEvent } from '../libs/line-bot';
const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;
export const lineWebhookMiddlewares = [
    // Custom LINE webhook signature validation middleware
    async (c, next) => {
        const signature = c.req.header('X-Line-Signature');
        const body = await c.req.text();
        if (!signature || !body) {
            return c.json({ error: 'Invalid request' }, 400);
        }
        const hash = crypto
            .createHmac('SHA256', CHANNEL_SECRET)
            .update(body)
            .digest('base64');
        if (hash !== signature) {
            return c.json({ error: 'Invalid signature' }, 400);
        }
        // Parse body and attach to context
        c.set('lineEvents', JSON.parse(body).events);
        await next();
    },
    async (c) => {
        const events = c.get('lineEvents');
        const handleEventPromise = events.map(event => {
            console.log(event);
            switch (event.type) {
                case 'message':
                    return handleMessageEvent(event);
            }
            return;
        });
        const result = await Promise.all(handleEventPromise);
        return c.json(result);
    }
];
