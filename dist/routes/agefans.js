"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const lru_cache_1 = require("../utilities/lru-cache");
const agefans_lib_1 = require("../libs/agefans.lib");
const result_vm_1 = require("../view-models/result.vm");
const router = (0, express_1.Router)();
/**
 * @api {get} /agefans?keyword 取得番劇列表
 * @apiName GetAnimeList
 * @apiGroup AGE動漫
 * @apiVersion 1.0.0
 *
 * @apiParam {String} keyword 搜尋關鍵字
 *
 *
 * @apiSuccessExample Success Response
{
  "success": true,
  "resultCode": "200",
  "resultMessage": "",
  "items": [
    {
      "isnew": false,
      "id": "20190119",
      "wd": 1,
      "name": "公主連結！Re:Dive",
      "mtime": "2020-06-29 23:03:52",
      "namefornew": "第13話(完結)"
    }
  ]
}
 * @apiSuccessExample Success Response With Keyword
{
  "success": true,
  "resultCode": "200",
  "resultMessage": "",
  "items": [
    {
      "id": "20130023",
      "title": "進擊的巨人",
      "imgUrl": "https:////sc02.alicdn.com/kf/H1deba4ea3529412dbe9031f5cfad0bd00.jpg",
      "type": "TV",
      "originName": "進撃の巨人",
      "studio": "WIT STUDIO",
      "dateAired": "2013-04-07",
      "status": "完結",
      "tags": [
        "熱血",
        "懸疑",
        "奇幻",
        "劇情"
      ],
      "description": "電視動畫《進擊的巨人》改編自諫山創原作的同名漫畫，由WIT STUDIO負責制作。\n巨人支配著的世界。變成巨人的食物的人類建造起了高達50米的巨大牆壁、以自由為代價去防止牆外的巨人的侵略...。\n10歲的少年艾倫·耶格爾對牆外的世界充滿了好奇。艾倫滿足於牆內暫時和平的生活，而牆外歸來的人們卻充滿了絕望，與牆內的氛圍格格不入。艾倫把他們稱之為「家畜」，並認為這些人是「異物」。\n然而，能夠越過牆壁的超大型巨人出現了，艾倫的「夢」以及人們的「和平」瞬間土崩瓦解……"
    }
  ]
}
 *
 */
router.get('/', async (req, res, next) => {
    try {
        const { keyword, mode = '' } = req.query;
        const result = new result_vm_1.ResultListGenericVM();
        const key = `agefans-list-${keyword}-${mode}`;
        const cacheItems = lru_cache_1.lruCache.get(key);
        if (cacheItems) {
            result.items = cacheItems;
        }
        else {
            if (mode === 'update') {
                result.items = await (0, agefans_lib_1.getAnimeUpdate)();
            }
            else {
                result.items = keyword ? await (0, agefans_lib_1.queryAnimeList)(keyword) : await (0, agefans_lib_1.getAnimeList)();
            }
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
        const result = new result_vm_1.ResultGenericVM();
        const key = `agefans-details-${id}`;
        const cacheItem = lru_cache_1.lruCache.get(key);
        if (cacheItem) {
            result.item = cacheItem;
        }
        else {
            result.item = await (0, agefans_lib_1.getAnimeDetails)(id);
            lru_cache_1.lruCache.set(key, result.item);
        }
        res.result = result.setResultValue(true, result_vm_1.ResultCode.success);
        next();
    }
    catch (err) {
        next(err);
    }
});
router.get('/:id/:pId/:eId', async (req, res) => {
    const { id, pId, eId } = req.params;
    const key = `agefans-video-${id}-${pId}-${eId}`;
    const cacheVideoUrl = lru_cache_1.lruCache.get(key);
    const videoUrl = cacheVideoUrl || await (0, agefans_lib_1.getAnimeVideo)(id, pId, eId);
    if (videoUrl) {
        lru_cache_1.lruCache.set(key, videoUrl);
    }
    res.redirect(videoUrl);
});
exports.default = router;
//# sourceMappingURL=agefans.js.map