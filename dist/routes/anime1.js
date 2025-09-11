"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
// import  ytDL from 'youtube-dl';
const lru_cache_1 = require("../utilities/lru-cache");
const anime1_lib_1 = require("../libs/anime1.lib");
const result_vm_1 = require("../view-models/result.vm");
const app = new hono_1.Hono();
app.get('/', async (c) => {
    try {
        const result = new result_vm_1.ResultListGenericVM();
        const key = `anime1-list`;
        const cacheItems = lru_cache_1.lruCache.get(key);
        if (cacheItems) {
            result.items = cacheItems;
        }
        else {
            result.items = await (0, anime1_lib_1.getBangumiList)();
            lru_cache_1.lruCache.set(key, result.items);
        }
        result.setResultValue(true, result_vm_1.ResultCode.success);
        return c.json(result);
    }
    catch (err) {
        throw err;
    }
});
app.get('/:id', async (c) => {
    try {
        const { id } = c.req.param();
        const result = new result_vm_1.ResultListGenericVM();
        const key = `anime1-${id}`;
        const cacheValue = lru_cache_1.lruCache.get(key);
        if (cacheValue) {
            // @ts-ignore
            const { item, items } = cacheValue;
            result.item = item;
            result.items = items;
        }
        else {
            const { title, items } = await (0, anime1_lib_1.getBangumiEpisode)(id);
            result.items = items;
            result.item = {
                id,
                title
            };
            lru_cache_1.lruCache.set(key, {
                items: result.items,
                item: result.item
            });
        }
        result.setResultValue(true, result_vm_1.ResultCode.success);
        return c.json(result);
    }
    catch (err) {
        throw err;
    }
});
app.get('/video/:id/download', async (c) => {
    const { id } = c.req.param();
    const { name } = c.req.query();
    const { type, url, setCookies } = await (0, anime1_lib_1.getBangumiPlayerById)(id);
    if (!url) {
        throw new Error('URL Not Found.');
    }
    c.header('Content-disposition', `attachment; filename=${name ? encodeURIComponent(name) : id}.mp4`);
    c.header('Content-type', 'video/mp4');
    // 臨時：返回簡單響應，稍後改進流處理
    return c.text('Video download in progress...', 200);
});
exports.default = app;
//# sourceMappingURL=anime1.js.map