"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const lru_cache_1 = require("../utilities/lru-cache");
const meta_fetcher_lib_1 = require("../libs/meta-fetcher.lib");
const result_vm_1 = require("../view-models/result.vm");
const app = new hono_1.Hono();
app.get('/', async (c) => {
    try {
        const { url } = c.req.query();
        const result = new result_vm_1.ResultGenericVM();
        const key = `meta-fetcher-${url}`;
        const cacheValue = lru_cache_1.lruCache.get(key);
        if (cacheValue) {
            result.item = cacheValue;
        }
        else {
            result.item = await (0, meta_fetcher_lib_1.fetchMetaData)(`${url}`);
            lru_cache_1.lruCache.set(key, result.item);
        }
        result.setResultValue(true, result_vm_1.ResultCode.success);
        return c.json(result);
    }
    catch (err) {
        throw err;
    }
});
exports.default = app;
//# sourceMappingURL=meta-fetcher.js.map