"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const form_data_1 = __importDefault(require("form-data"));
const line_lib_1 = require("../libs/line.lib");
const youtube_lib_1 = require("../libs/youtube.lib");
const cwb_lib_1 = require("../libs/cwb.lib");
const result_vm_1 = require("../view-models/result.vm");
const router = (0, express_1.Router)();
const subscribe = async (callback, topic) => {
    try {
        const formData = new form_data_1.default();
        const hub = {
            callback,
            topic,
            verify: 'async',
            mode: 'subscribe',
            verify_token: '',
            secret: '',
            lease_seconds: '',
        };
        for (const key in hub) {
            formData.append(`hub.${key}`, hub[key]);
        }
        await (0, node_fetch_1.default)(`https://pubsubhubbub.appspot.com/subscribe`, {
            method: 'POST',
            body: formData,
        });
        return true;
    }
    catch (err) {
        console.error(err.message);
        return false;
    }
};
const handleGooglePubsubhubbubChallenge = (req, res) => {
    const query = req.query;
    console.log(query);
    res.status(+result_vm_1.ResultCode.success).send(query['hub.challenge']);
};
router.get('/yt', handleGooglePubsubhubbubChallenge);
router.get('/cwb', handleGooglePubsubhubbubChallenge);
router.post('/yt', async (req, res) => {
    const xmlString = req['rawBody'];
    const { entry, self } = (0, youtube_lib_1.parseXMLtoData)(xmlString);
    console.log('entry', entry);
    if (entry) {
        (0, line_lib_1.sendNotifyMessage)({
            message: `
--- ${entry.author.name} 有新的通知! ---
影片標題: ${entry.title}
影片連結: ${entry.link.href}
發布時間: ${(0, moment_timezone_1.default)(entry.published).format('YYYY/MM/DD HH:mm')}
      `,
            // imageFullsize: `https://img.youtube.com/vi/${entry["yt:videoId"]}/maxresdefault.jpg`,
            // imageThumbnail: `https://img.youtube.com/vi/${entry["yt:videoId"]}/default.jpg`
        });
        subscribe(`${req.protocol}://${req.hostname}${req.originalUrl}`, self);
    }
    res.status(+result_vm_1.ResultCode.success).send(entry ? 'ok' : '不ok');
});
router.post('/cwb', async (req, res) => {
    const xmlString = req['rawBody'];
    const items = (0, cwb_lib_1.parseCwbXMLtoItems)(xmlString);
    if (items.length) {
        items.forEach(item => {
            (0, line_lib_1.sendNotifyMessage)({
                message: `
--- 中央氣象局警報、特報 ---
${item.title}
${item.description.replace(/\\n/g, '\n')}
${item.link}
        `,
            });
        });
        // console.log(req.hostname);
        subscribe(`${req.protocol}://${req.hostname}${req.originalUrl}`, 'https://www.cwb.gov.tw/rss/Data/cwb_warning.xml');
    }
    res.status(+result_vm_1.ResultCode.success).send(items.length ? 'ok' : '不ok');
});
router.post('/line-notify', async (req, res) => {
    const { code } = req.body;
    const isOk = await (0, line_lib_1.handleSubscribe)(code, `https://${req.hostname}${req.originalUrl}`);
    res.status(+result_vm_1.ResultCode.success).send(isOk ? '訂閱成功' : '訂閱失敗');
});
exports.default = router;
//# sourceMappingURL=notifications.js.map