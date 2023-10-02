"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const lru_cache_1 = require("../utilities/lru-cache");
const himawari_lib_1 = require("../libs/himawari.lib");
const result_vm_1 = require("../view-models/result.vm");
const router = (0, express_1.Router)();
router.get('/', async (req, res, next) => {
    try {
        const { sort, keyword, cat, page, mode, sortby } = req.query;
        const result = new result_vm_1.ResultListGenericVM();
        if (mode === 'commentgroup') {
            const { items, pageInfo } = await (0, himawari_lib_1.getHimawariDanmakuList)(keyword, +page, sort, sortby);
            result.items = items;
            result.page = pageInfo;
        }
        else {
            const { channel, items } = await (0, himawari_lib_1.getHimawariDougaList)({
                sort: sort,
                keyword: keyword,
                cat: cat,
                page,
            });
            result.item = channel;
            result.items = items;
        }
        res.result = result.setResultValue(true, result_vm_1.ResultCode.success);
        next();
    }
    catch (err) {
        next(err);
    }
});
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = new result_vm_1.ResultGenericVM();
        const movieInfo = await (0, himawari_lib_1.getHimawariDougaDetails)(id);
        result.item = movieInfo;
        res.result = result.setResultValue(true, result_vm_1.ResultCode.success);
        next();
    }
    catch (err) {
        next(err);
    }
});
/**
 * @api {get} /himawari/:id/danmaku?mode= 取得動畫彈幕
 * @apiName GetHimawariDanmaku
 * @apiGroup 向日葵動畫
 * @apiVersion 1.0.0
 *
 * @apiParam {String} id 向日葵動畫的 Id
 * @apiParam {String} mode 為`download`時直接下載彈幕 .json
 *
 *
 * @apiSuccessExample Success Response
{
  "success": true,
  "resultCode": "200",
  "resultMessage": "",
  "items": [
    {
      "id": "KKc8vr.I2U",
      "no": "286486964",
      "mail": "",
      "vpos": 42,
      "vpos_master": 140,
      "time": 1.4,
      "date": 1596102341,
      "msg": "チー牛絶賛アニメ",
      "text": "チー牛絶賛アニメ",
      "digital_time": "00:01",
      "date_iso_string": "2020-07-30T09:45:41.000Z"
    }
  ]
}
 *
 */
router.get('/:id/danmaku', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { mode, group } = req.query;
        const result = new result_vm_1.ResultListGenericVM();
        const key = `himawari-danmaku-${id}`;
        const cacheItems = lru_cache_1.lruCache.get(key);
        if (cacheItems) {
            result.items = cacheItems;
        }
        else {
            const danmakuList = await (0, himawari_lib_1.getHimawariDougaDanmaku)(id, !!group);
            result.items = danmakuList;
            if (result.items.length) {
                lru_cache_1.lruCache.set(key, result.items);
            }
        }
        if (mode === 'download') {
            res.setHeader('Content-disposition', `attachment; filename=himawari-${id}.json`);
            res.setHeader('Content-type', 'application/json');
            res.write(JSON.stringify(result.items, null, 4), (err) => {
                if (err) {
                    next(err);
                }
                res.status(+result_vm_1.ResultCode.success).end();
                return;
            });
            return;
        }
        res.result = result.setResultValue(true, result_vm_1.ResultCode.success);
        next();
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=himawari.js.map