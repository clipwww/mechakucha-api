"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const convert_lib_1 = require("../libs/convert.lib");
const router = (0, express_1.Router)();
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
router.get('/m3u8toMp4', async (req, res, next) => {
    try {
        const { url, name } = req.query;
        if (!url) {
            throw Error('`url` is empty.');
        }
        const stream = (0, convert_lib_1.m3u8toStream)(url);
        res.setHeader('Content-disposition', `attachment; filename=${name || +new Date()}.mp4`);
        res.setHeader('Content-type', 'video/mp4');
        stream.pipe(res);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=convert.js.map