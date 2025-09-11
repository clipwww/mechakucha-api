"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lineWebhookMiddlewares = void 0;
const crypto_1 = __importDefault(require("crypto"));
const line_bot_1 = require("../libs/line-bot");
const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;
exports.lineWebhookMiddlewares = [
    // Custom LINE webhook signature validation middleware
    async (c, next) => {
        const signature = c.req.header('X-Line-Signature');
        const body = await c.req.text();
        if (!signature || !body) {
            return c.json({ error: 'Invalid request' }, 400);
        }
        const hash = crypto_1.default
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
                    return (0, line_bot_1.handleMessageEvent)(event);
            }
            return;
        });
        const result = await Promise.all(handleEventPromise);
        return c.json(result);
    }
];
//# sourceMappingURL=webhook.middleware.js.map