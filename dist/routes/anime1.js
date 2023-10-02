"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// import  ytDL from 'youtube-dl';
const lru_cache_1 = require("../utilities/lru-cache");
const utilities_1 = require("../utilities");
const convert_lib_1 = require("../libs/convert.lib");
const anime1_lib_1 = require("../libs/anime1.lib");
const result_vm_1 = require("../view-models/result.vm");
const router = (0, express_1.Router)();
router.get('/', async (req, res, next) => {
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
        res.result = result.setResultValue(true, result_vm_1.ResultCode.success);
        next();
    }
    catch (err) {
        next(err);
    }
});
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
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
        res.result = result.setResultValue(true, result_vm_1.ResultCode.success);
        next();
    }
    catch (err) {
        next(err);
    }
});
router.get('/video/:id/download', async (req, res) => {
    const { id } = req.params;
    const { name } = req.query;
    const { type, url, setCookies } = await (0, anime1_lib_1.getBangumiPlayerById)(id);
    if (!url) {
        throw Error('URL Not Found.');
    }
    res.setHeader('Content-disposition', `attachment; filename=${name ? encodeURIComponent(name) : id}.mp4`);
    res.setHeader('Content-type', 'video/mp4');
    switch (type) {
        case 'mp4':
            const { data, headers } = await utilities_1.axiosInstance.get(url, {
                headers: {
                    Cookie: setCookies === null || setCookies === void 0 ? void 0 : setCookies.join(';'),
                    withCredentials: true,
                },
                responseType: 'stream',
            });
            data.pipe(res);
            break;
        case 'm3u8':
            const stream = (0, convert_lib_1.m3u8toStream)(url);
            stream.pipe(res);
            break;
        case 'yt':
            console.log('youtube download');
            // const video = ytDL(url, ['--format=18'], { cwd: __dirname });
            // video.pipe(res)
            break;
    }
});
exports.default = router;
//# sourceMappingURL=anime1.js.map