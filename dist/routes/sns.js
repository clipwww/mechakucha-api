"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const lru_cache_1 = require("../utilities/lru-cache");
const sns_lib_1 = require("../libs/sns.lib");
const result_vm_1 = require("../view-models/result.vm");
const router = (0, express_1.Router)();
router.get('/fb/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
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
        res.result = result.setResultValue(true, result_vm_1.ResultCode.success);
        next();
    }
    catch (err) {
        next(err);
    }
});
router.get('/ig/user/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
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
        res.result = result.setResultValue(true, result_vm_1.ResultCode.success);
        next();
    }
    catch (err) {
        next(err);
    }
});
router.get('/ig/hashtag/:tag', async (req, res, next) => {
    try {
        const { tag } = req.params;
        const { end_cursor = '' } = req.query;
        const result = new result_vm_1.ResultListGenericVM();
        const { posts, page_info } = await (0, sns_lib_1.crawlerInstagramHashTag)(tag, end_cursor);
        result.items = posts;
        result.item = page_info;
        res.result = result.setResultValue(true, result_vm_1.ResultCode.success);
        next();
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=sns.js.map