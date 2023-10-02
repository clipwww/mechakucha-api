"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const lru_cache_1 = require("../utilities/lru-cache");
const result_vm_1 = require("../view-models/result.vm");
const blog_lib_1 = require("../libs/blog.lib");
const router = (0, express_1.Router)();
router.get('/post/:id/view-count', async (req, res, next) => {
    try {
        const { id } = req.params;
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
        res.result = result.setResultValue(true, result_vm_1.ResultCode.success);
        next();
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
router.post('/post/:id/view-count', async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = new result_vm_1.ResultGenericVM();
        const cacheKey = `${id}-view-count`;
        const post = await (0, blog_lib_1.addViewCount)(id);
        result.item = post;
        lru_cache_1.lruCache.set(cacheKey, post);
        res.result = result.setResultValue(true, result_vm_1.ResultCode.success);
        next();
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=blog.js.map