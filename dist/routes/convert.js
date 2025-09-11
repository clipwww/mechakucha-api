"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const convert_lib_1 = require("../libs/convert.lib");
const app = new hono_1.Hono();
/**
 * @api {get} /convert/m3u8toMp4?url M3u8 轉 Mp4
 * @apiName ConvertM3u8toMp4
 * @apiGroup 轉檔工具
 * @apiVersion 1.0.0
 *
 * @apiParam {String} url 欲轉換的m3u8網址
 *
 *
 */
app.get('/m3u8toMp4', async (c) => {
    try {
        const { url, name } = c.req.query();
        if (!url) {
            throw new Error('`url` is empty.');
        }
        const stream = (0, convert_lib_1.m3u8toStream)(url);
        // 在 Hono 中處理流式響應
        c.header('Content-disposition', `attachment; filename=${name || +new Date()}.mp4`);
        c.header('Content-type', 'video/mp4');
        // 臨時：返回一個簡單的響應，稍後改進流處理
        return c.text('Stream conversion in progress...', 200);
    }
    catch (err) {
        throw err;
    }
});
exports.default = app;
//# sourceMappingURL=convert.js.map