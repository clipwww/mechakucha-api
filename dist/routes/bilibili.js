"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const lru_cache_1 = require("../utilities/lru-cache");
const bilibili_lib_1 = require("../libs/bilibili.lib");
const result_vm_1 = require("../view-models/result.vm");
const app = new hono_1.Hono();
app.get('/:id/danmaku', async (c) => {
    try {
        const { id } = c.req.param();
        const { mode } = c.req.query();
        const result = new result_vm_1.ResultListGenericVM();
        const key = `bilibili-danmaku-${id}`;
        const cacheItems = lru_cache_1.lruCache.get(key);
        if (cacheItems) {
            result.items = cacheItems;
        }
        else {
            const danmakuList = await (0, bilibili_lib_1.getBiliBiliDanmaku)(id);
            result.items = danmakuList;
            if (result.items.length) {
                lru_cache_1.lruCache.set(key, result.items);
            }
        }
        if (mode === 'download') {
            c.header('Content-disposition', `attachment; filename=bilibili-${id}.json`);
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
//# sourceMappingURL=bilibili.js.map