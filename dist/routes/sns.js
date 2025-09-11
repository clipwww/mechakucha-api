"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const lru_cache_1 = require("../utilities/lru-cache");
const sns_lib_1 = require("../libs/sns.lib");
const result_vm_1 = require("../view-models/result.vm");
const app = new hono_1.Hono();
app.get('/fb/:id', async (c) => {
    try {
        const { id } = c.req.param();
        const result = new result_vm_1.ResultGenericVM();
        const key = `fb-${id}`;
        const cacheValue = lru_cache_1.lruCache.get(key);
        if (cacheValue) {
            result.item = cacheValue;
        }
        else {
            result.item = await (0, sns_lib_1.crawlerFacebookFanPage)(id);
            lru_cache_1.lruCache.set(key, result.item);
        }
        result.setResultValue(true, result_vm_1.ResultCode.success);
        return c.json(result);
    }
    catch (err) {
        throw err;
    }
});
app.get('/ig/user/:id', async (c) => {
    try {
        const { id } = c.req.param();
        const result = new result_vm_1.ResultListGenericVM();
        const key = `ig-user-${id}`;
        const cacheValue = lru_cache_1.lruCache.get(key);
        if (cacheValue) {
            result.items = cacheValue;
        }
        else {
            result.items = await (0, sns_lib_1.crawlerInstagramFanPage)(id);
            lru_cache_1.lruCache.set(key, result.items);
        }
        result.setResultValue(true, result_vm_1.ResultCode.success);
        return c.json(result);
    }
    catch (err) {
        throw err;
    }
});
app.get('/ig/hashtag/:tag', async (c) => {
    try {
        const { tag } = c.req.param();
        const { end_cursor = '' } = c.req.query();
        const result = new result_vm_1.ResultListGenericVM();
        const { posts, page_info } = await (0, sns_lib_1.crawlerInstagramHashTag)(tag, end_cursor);
        result.items = posts;
        result.item = page_info;
        result.setResultValue(true, result_vm_1.ResultCode.success);
        return c.json(result);
    }
    catch (err) {
        throw err;
    }
});
exports.default = app;
//# sourceMappingURL=sns.js.map