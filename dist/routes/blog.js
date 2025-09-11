"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const lru_cache_1 = require("../utilities/lru-cache");
const result_vm_1 = require("../view-models/result.vm");
const blog_lib_1 = require("../libs/blog.lib");
const app = new hono_1.Hono();
app.get('/post/:id/view-count', async (c) => {
    try {
        const { id } = c.req.param();
        const result = new result_vm_1.ResultGenericVM();
        const cacheKey = `${id}-view-count`;
        const cacheValue = lru_cache_1.lruCache.get(cacheKey);
        if (cacheValue) {
            result.item = cacheValue;
        }
        else {
            const post = await (0, blog_lib_1.getViewCount)(id);
            result.item = post;
        }
        result.setResultValue(true, result_vm_1.ResultCode.success);
        return c.json(result);
    }
    catch (err) {
        console.log(err);
        throw err;
    }
});
app.post('/post/:id/view-count', async (c) => {
    try {
        const { id } = c.req.param();
        const result = new result_vm_1.ResultGenericVM();
        const cacheKey = `${id}-view-count`;
        const post = await (0, blog_lib_1.addViewCount)(id);
        result.item = post;
        lru_cache_1.lruCache.set(cacheKey, post);
        result.setResultValue(true, result_vm_1.ResultCode.success);
        return c.json(result);
    }
    catch (err) {
        console.log(err);
        throw err;
    }
});
exports.default = app;
//# sourceMappingURL=blog.js.map