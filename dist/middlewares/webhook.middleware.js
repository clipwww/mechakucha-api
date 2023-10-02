"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lineWebhookMiddlewares = void 0;
const line_bot_1 = require("../libs/line-bot");
exports.lineWebhookMiddlewares = [
    line_bot_1.lineBotMiddleware,
    (req, res) => {
        const handleEventPromise = req.body.events.map(event => {
            console.log(event);
            switch (event.type) {
                case 'message':
                    return (0, line_bot_1.handleMessageEvent)(event);
            }
            return;
        });
        Promise.all(handleEventPromise).then(result => {
            res.json(result);
        });
    }
];
//# sourceMappingURL=webhook.middleware.js.map