"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const lru_cache_1 = require("../utilities/lru-cache");
const bahamut_lib_1 = require("../libs/bahamut.lib");
const result_vm_1 = require("../view-models/result.vm");
const router = (0, express_1.Router)();
router.get('/:sn/danmaku', async (req, res, next) => {
    try {
        const { sn } = req.params;
        const { mode } = req.query;
        const result = new result_vm_1.ResultListGenericVM();
        const key = `bahamut-danmaku-${sn}`;
        const cacheItems = lru_cache_1.lruCache.get(key);
        if (cacheItems) {
            result.items = cacheItems;
        }
        else {
            const danmakuList = await (0, bahamut_lib_1.getBahumutDanmaku)(sn);
            result.items = danmakuList;
            if (result.items.length) {
                lru_cache_1.lruCache.set(key, result.items);
            }
        }
        if (mode === 'download') {
            res.setHeader('Content-disposition', `attachment; filename=bahamut-${sn}.json`);
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
//# sourceMappingURL=bahamut.js.map