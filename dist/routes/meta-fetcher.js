"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const lru_cache_1 = require("../utilities/lru-cache");
const meta_fetcher_lib_1 = require("../libs/meta-fetcher.lib");
const result_vm_1 = require("../view-models/result.vm");
const router = (0, express_1.Router)();
router.get('/', async (req, res, next) => {
    try {
        const { url } = req.query;
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
        res.result = result.setResultValue(true, result_vm_1.ResultCode.success);
        next();
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=meta-fetcher.js.map