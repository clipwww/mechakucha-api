"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const lru_cache_1 = require("../utilities/lru-cache");
const bahamut_lib_1 = require("../libs/bahamut.lib");
const result_vm_1 = require("../view-models/result.vm");
const app = new hono_1.Hono();
app.get('/:sn/danmaku', async (c) => {
    try {
        const { sn } = c.req.param();
        const { mode } = c.req.query();
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
            c.header('Content-disposition', `attachment; filename=bahamut-${sn}.json`);
            c.header('Content-type', 'application/json');
            return c.json(result.items, 200);
        }
        result.setResultValue(true, result_vm_1.ResultCode.success);
        return c.json(result);
    }
    catch (err) {
        throw err;
    }
});
exports.default = app;
//# sourceMappingURL=bahamut.js.map