"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const lru_cache_1 = require("../utilities/lru-cache");
const movie_lib_1 = require("../libs/movie.lib");
const result_vm_1 = require("../view-models/result.vm");
const movie_model_1 = require("../nosql/models/movie.model");
const line_lib_1 = require("../libs/line.lib");
const router = (0, express_1.Router)();
/**
 * @api {get} /movie/rating?keyword= 取得分級證字號搜尋
 * @apiName GetMovieRating
 * @apiGroup 電影
 * @apiVersion 1.0.0
 *
 * @apiParam {String} keyword 關鍵字
 *
 *
 * @apiSuccessExample Success Response
{
  "success": true,
  "resultCode": "200",
  "resultMessage": "",
  "items": [
    {
      "id": "108528",
      "no": "108528",
      "officialDoc": "局影外字第108528號",
      "year": "108",
      "title": "《少女與戰車 總集篇4DX》-第63屆戰車道全國高中生大會",
      "country": "日本",
      "runtime": "2時2分1秒",
      "rating": "普遍級"
    },
  ]
}
 *
 */
router.get('/rating', async (req, res, next) => {
    var _a, _b;
    try {
        let { keyword } = req.query;
        keyword = keyword ? `${keyword}` : '';
        const result = new result_vm_1.ResultListGenericVM();
        const items = await (0, movie_lib_1.searchMovieRating)(keyword);
        result.items = items;
        res.result = result.setResultValue(true, result_vm_1.ResultCode.success);
        const key = `movie-rating-${keyword}`;
        const cacheValue = lru_cache_1.lruCache.get(key);
        if (((_a = cacheValue === null || cacheValue === void 0 ? void 0 : cacheValue[0]) === null || _a === void 0 ? void 0 : _a.no) !== ((_b = items === null || items === void 0 ? void 0 : items[0]) === null || _b === void 0 ? void 0 : _b.no) && keyword.includes('戰車')) {
            items.forEach(async (item) => {
                const movieDoc = await movie_model_1.MovieRatingModel.findOne({ no: item.no });
                if (!movieDoc) {
                    const { id } = item, other = __rest(item, ["id"]);
                    await movie_model_1.MovieRatingModel.create(other);
                    (0, line_lib_1.sendNotifyMessage)({
                        message: `
--- 電影分級查詢結果: "${keyword}" ---
找到一筆新的資料: ${item.title}
            `
                    });
                }
            });
            lru_cache_1.lruCache.set(key, items, 1000 * 60 * 60 * 24 * 30);
        }
        next();
    }
    catch (err) {
        next(err);
    }
});
router.get('/rating/:certificateNumber', async (req, res, next) => {
    try {
        let { certificateNumber } = req.params;
        if (!certificateNumber) {
            throw Error('parameters is empty');
        }
        const key = `movie-rating-details-${certificateNumber}`;
        const result = new result_vm_1.ResultGenericVM();
        const cacheValue = lru_cache_1.lruCache.get(key);
        if (cacheValue) {
            result.item = cacheValue;
        }
        else {
            result.item = await (0, movie_lib_1.searchMovieRatingDetails)(certificateNumber);
        }
        res.result = result.setResultValue(true, result_vm_1.ResultCode.success);
        lru_cache_1.lruCache.set(key, result.item, 1000 * 60 * 60 * 24 * 30);
        next();
    }
    catch (err) {
        next(err);
    }
});
router.get('/city', async (req, res, next) => {
    try {
        const result = new result_vm_1.ResultListGenericVM();
        result.items = await (0, movie_lib_1.getCityList)();
        res.result = result.setResultValue(true, result_vm_1.ResultCode.success);
        next();
    }
    catch (err) {
        next(err);
    }
});
router.get('/list', async (req, res, next) => {
    try {
        const result = new result_vm_1.ResultListGenericVM();
        result.items = await (0, movie_lib_1.getMovieList)();
        res.result = result.setResultValue(true, result_vm_1.ResultCode.success);
        next();
    }
    catch (err) {
        next(err);
    }
});
router.get('/list-group-by-date', async (req, res, next) => {
    try {
        const result = new result_vm_1.ResultListGenericVM();
        result.items = await (0, movie_lib_1.getMovieListGroupByDate)();
        res.result = result.setResultValue(true, result_vm_1.ResultCode.success);
        next();
    }
    catch (err) {
        next(err);
    }
});
router.get('/next', async (req, res, next) => {
    try {
        const result = new result_vm_1.ResultListGenericVM();
        result.items = await (0, movie_lib_1.getMovieListGroupByDate)('next');
        res.result = result.setResultValue(true, result_vm_1.ResultCode.success);
        next();
    }
    catch (err) {
        next(err);
    }
});
router.get('/theater', async (req, res, next) => {
    try {
        const { cityId } = req.query;
        const result = new result_vm_1.ResultListGenericVM();
        result.items = await (0, movie_lib_1.getTheaterList)(cityId);
        res.result = result.setResultValue(true, result_vm_1.ResultCode.success);
        next();
    }
    catch (err) {
        next(err);
    }
});
router.get('/times/:movieId', async (req, res, next) => {
    try {
        const { movieId } = req.params;
        const { cityId } = req.query;
        const result = new result_vm_1.ResultListGenericVM();
        const { item, items } = await (0, movie_lib_1.getMovieTimes)(movieId, cityId);
        result.item = item;
        result.items = items;
        res.result = result.setResultValue(true, result_vm_1.ResultCode.success);
        next();
    }
    catch (err) {
        next(err);
    }
});
router.get('/theater/:theaterId', async (req, res, next) => {
    try {
        const { theaterId } = req.params;
        const { date, cityId } = req.query;
        const result = new result_vm_1.ResultListGenericVM();
        const { item, items } = await (0, movie_lib_1.getTheaterTimes)(theaterId, cityId, date);
        result.item = item;
        result.items = items;
        res.result = result.setResultValue(true, result_vm_1.ResultCode.success);
        next();
    }
    catch (err) {
        next(err);
    }
});
router.get('/vieshow/now', async (req, res, next) => {
    try {
        const result = new result_vm_1.ResultListGenericVM();
        const key = `movie-vieshow-now`;
        const cacheValue = lru_cache_1.lruCache.get(key);
        if (cacheValue) {
            result.items = cacheValue;
        }
        else {
            const movieList = await (0, movie_lib_1.getVieShowNowMovieList)();
            result.items = movieList;
            lru_cache_1.lruCache.set(key, movieList, 1000 * 60 * 60 * 2);
        }
        res.result = result.setResultValue(true, result_vm_1.ResultCode.success);
        next();
    }
    catch (err) {
        next(err);
    }
});
router.get('/vieshow/coming', async (req, res, next) => {
    try {
        const result = new result_vm_1.ResultListGenericVM();
        const key = `movie-vieshow-coming`;
        const cacheValue = lru_cache_1.lruCache.get(key);
        if (cacheValue) {
            result.items = cacheValue;
        }
        else {
            const movieList = await (0, movie_lib_1.getVieShowComingMovieList)();
            result.items = movieList;
            lru_cache_1.lruCache.set(key, movieList, 1000 * 60 * 60 * 2);
        }
        res.result = result.setResultValue(true, result_vm_1.ResultCode.success);
        next();
    }
    catch (err) {
        next(err);
    }
});
router.get('/vieshow/show-times', async (req, res, next) => {
    try {
        const { 'cinema-code': cinemaCode } = req.query;
        const result = new result_vm_1.ResultListGenericVM();
        if (!cinemaCode) {
            throw new Error('cinema-code is empty.');
        }
        const key = `movie-vieshow-show-times-${cinemaCode}`;
        const cacheValue = lru_cache_1.lruCache.get(key);
        if (cacheValue) {
            result.items = cacheValue;
        }
        else {
            const movieList = await (0, movie_lib_1.getVieShowMovieShowTimes)(cinemaCode);
            result.items = movieList;
            lru_cache_1.lruCache.set(key, movieList, 1000 * 60 * 5);
        }
        res.result = result.setResultValue(true, result_vm_1.ResultCode.success);
        next();
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=movie.js.map