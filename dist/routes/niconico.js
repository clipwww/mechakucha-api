"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const lru_cache_1 = require("../utilities/lru-cache");
const niconico_lib_1 = require("../libs/niconico.lib");
const result_vm_1 = require("../view-models/result.vm");
const router = (0, express_1.Router)();
/**
 * @api {get} /niconico/:id/danmaku?mode= 取得動畫彈幕
 * @apiName GetNicoNicoDanmaku
 * @apiGroup NicoNico動畫
 * @apiVersion 1.0.0
 *
 * @apiParam {String} id NicoNico 動畫的 Id
 * @apiParam {String} mode 為`download`時直接下載彈幕 .json
 *
 *
 * @apiSuccessExample Success Response
{
  "success": true,
  "resultCode": "200",
  "resultMessage": "",
  "items": [
    {
      "text": "ガルパン最終章おめでとう！",
      "time": 0.78,
      "color": "#ffffff",
      "mode": "BOTTOM",
      "size": 36,
      "id": 19135,
      "user_id": "RLmRNQvcNNzRDZd1IV4HMg5OJlQ",
      "date": 1472384190,
      "date_iso_string": "2016-08-28T11:36:30.000Z"
    }
  ]
}
 *
 */
router.get('/:id/danmaku', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { mode } = req.query;
        const result = new result_vm_1.ResultListGenericVM();
        const key = `niconico-danmaku-${id}`;
        const cacheItems = lru_cache_1.lruCache.get(key);
        if (cacheItems) {
            result.items = cacheItems;
        }
        else {
            const danmakuList = await (0, niconico_lib_1.getNicoNicoDanmaku)(id);
            result.items = danmakuList;
            if (result.items.length) {
                lru_cache_1.lruCache.set(key, result.items);
            }
        }
        if (mode === 'download') {
            res.setHeader('Content-disposition', `attachment; filename=niconico-${id}.json`);
            res.setHeader('Content-type', 'application/json');
            res.write(JSON.stringify(result.items, null, 4), (err) => {
                if (err) {
                    next(err);
                }
                res.status(+result_vm_1.ResultCode.success).end();
                return;
            });
            return;
        }
        res.result = result.setResultValue(true, result_vm_1.ResultCode.success);
        next();
    }
    catch (err) {
        next(err);
    }
});
/**
 * @api {get} /niconico/ranking 取得 Nico 排行榜
 * @apiName GetNicoNicoRanking
 * @apiGroup NicoNico動畫
 * @apiVersion 1.0.0
 *
 * @apiParam {String} type 排行類型 default. all
 * @apiParam {String} term 排行時間 default. 24h
 *
 *
 * @apiSuccessExample Success Response
{
  "success": true,
  "resultCode": "200",
  "resultMessage": "",
  "items": [
    {
      "title": "第1位：ウマ娘 プリティーダービー Season 2 第1話「トウカイテイオー」",
      "link": "https://www.nicovideo.jp/watch/so38015385?ref=rss_specified_ranking_rss2",
      "pubDate": "2021-01-06T09:13:26.000Z",
      "description": "動画一覧はこちらシンボリルドルフに憧れて無敗の三冠を目指すトウカイテイオーは、次走の日本ダービーを目",
      "id": "so38015385",
      "originDescription": "<p class=\"nico-thumbnail\"><img alt=\"ウマ娘 プリティーダービー Season 2 第1話「トウカイテイオー」\" src=\"https://nicovideo.cdn.nimg.jp/thumbnails/38015385/38015385.87708699\" width=\"94\" height=\"70\" border=\"0\"/></p>\n                                <p class=\"nico-description\">動画一覧はこちらシンボリルドルフに憧れて無敗の三冠を目指すトウカイテイオーは、次走の日本ダービーを目</p>\n                                <p class=\"nico-info\"><small><strong class=\"nico-info-length\">23:55</strong>｜<strong class=\"nico-info-date\">2021年01月05日 12：00：00</strong> 投稿<br/><strong>合計</strong>&nbsp;&#x20;再生：<strong class=\"nico-info-total-view\">82,257</strong>&nbsp;&#x20;コメント：<strong class=\"nico-info-total-res\">12,268</strong>&nbsp;&#x20;マイリスト：<strong class=\"nico-info-total-mylist\">413</strong></small></p>",
      "memo": "",
      "timeLength": "23:55",
      "nicoInfoDate": "2021年01月05日 12：00：00",
      "totalView": 82257,
      "commentCount": 12268,
      "mylistCount": 413,
      "thumbnailSrc": "https://nicovideo.cdn.nimg.jp/thumbnails/38015385/38015385.87708699"
    }
  ]
}
 *
 */
router.get('/ranking', async (req, res, next) => {
    try {
        const { type, term } = req.query;
        const result = new result_vm_1.ResultListGenericVM();
        const key = `niconico-ranking-${type}-${term}`;
        const cacheItems = lru_cache_1.lruCache.get(key);
        if (cacheItems) {
            result.items = cacheItems;
        }
        else {
            const rankingList = await (0, niconico_lib_1.getRankingList)(type, term);
            result.items = rankingList;
            if (result.items.length) {
                lru_cache_1.lruCache.set(key, result.items);
            }
        }
        res.result = result.setResultValue(true, result_vm_1.ResultCode.success);
        next();
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=niconico.js.map