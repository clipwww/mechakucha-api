"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const web_push_1 = __importDefault(require("web-push"));
const result_vm_1 = require("../view-models/result.vm");
const router = (0, express_1.Router)();
const tokens = [];
web_push_1.default.setVapidDetails('mailto:clipwww@gmail.com', process.env.WEB_PUSH_PUBLIC_KEY, process.env.WEB_PUSH_PRIVATE_KEY);
router.post('/', async (req, res, next) => {
    try {
        const result = new result_vm_1.ResultGenericVM();
        if (!req.body) {
            throw Error('paramaters is empty.');
        }
        tokens.push(req.body);
        res.result = result.setResultValue(true, result_vm_1.ResultCode.success);
        next();
    }
    catch (err) {
        next(err);
    }
});
router.get('/', async (req, res, next) => {
    try {
        const result = new result_vm_1.ResultGenericVM();
        const { title, body, url } = req.query;
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
        res.result = result.setResultValue(true, result_vm_1.ResultCode.success);
        next();
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=web-push.js.map