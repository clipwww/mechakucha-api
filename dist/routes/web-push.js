"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const web_push_1 = __importDefault(require("web-push"));
const result_vm_1 = require("../view-models/result.vm");
const app = new hono_1.Hono();
const tokens = [];
web_push_1.default.setVapidDetails('mailto:clipwww@gmail.com', process.env.WEB_PUSH_PUBLIC_KEY, process.env.WEB_PUSH_PRIVATE_KEY);
app.post('/', async (c) => {
    try {
        const result = new result_vm_1.ResultGenericVM();
        const body = await c.req.json();
        if (!body) {
            throw new Error('paramaters is empty.');
        }
        tokens.push(body);
        result.setResultValue(true, result_vm_1.ResultCode.success);
        return c.json(result);
    }
    catch (err) {
        throw err;
    }
});
app.get('/', async (c) => {
    try {
        const result = new result_vm_1.ResultGenericVM();
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
            promiseArr.push(web_push_1.default.sendNotification(token, JSON.stringify(sendData)));
        }
        await Promise.all(promiseArr);
        result.setResultValue(true, result_vm_1.ResultCode.success);
        return c.json(result);
    }
    catch (err) {
        throw err;
    }
});
exports.default = app;
//# sourceMappingURL=web-push.js.map