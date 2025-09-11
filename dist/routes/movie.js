"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const lru_cache_1 = require("../utilities/lru-cache");
const movie_lib_1 = require("../libs/movie.lib");
const result_vm_1 = require("../view-models/result.vm");
const movie_model_1 = require("../nosql/models/movie.model");
const line_lib_1 = require("../libs/line.lib");
const app = new hono_1.Hono();
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
app.get('/rating', async (c) => {
    try {
        let { keyword } = c.req.query();
        keyword = keyword ? `${keyword}` : '';
        const result = new result_vm_1.ResultListGenericVM();
        const items = await (0, movie_lib_1.searchMovieRating)(keyword);
        result.items = items;
        result.setResultValue(true, result_vm_1.ResultCode.success);
        const key = `movie-rating-${keyword}`;
        const cacheValue = lru_cache_1.lruCache.get(key);
        if (cacheValue?.[0]?.no !== items?.[0]?.no && keyword.includes('戰車')) {
            items.forEach(async (item) => {
                const movieDoc = await movie_model_1.MovieRatingModel.findOne({ no: item.no });
                if (!movieDoc) {
                    const { id, ...other } = item;
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
        return c.json(result);
    }
    catch (err) {
        throw err;
    }
});
app.get('/rating/:certificateNumber', async (c) => {
    try {
        let { certificateNumber } = c.req.param();
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
        result.setResultValue(true, result_vm_1.ResultCode.success);
        lru_cache_1.lruCache.set(key, result.item, 1000 * 60 * 60 * 24 * 30);
        return c.json(result);
    }
    catch (err) {
        throw err;
    }
});
app.get('/city', async (c) => {
    try {
        const result = new result_vm_1.ResultListGenericVM();
        result.items = await (0, movie_lib_1.getCityList)();
        result.setResultValue(true, result_vm_1.ResultCode.success);
        return c.json(result);
    }
    catch (err) {
        throw err;
    }
});
app.get('/list', async (c) => {
    try {
        const result = new result_vm_1.ResultListGenericVM();
        result.items = await (0, movie_lib_1.getMovieList)();
        result.setResultValue(true, result_vm_1.ResultCode.success);
        return c.json(result);
    }
    catch (err) {
        throw err;
    }
});
app.get('/list-group-by-date', async (c) => {
    try {
        const result = new result_vm_1.ResultListGenericVM();
        result.items = await (0, movie_lib_1.getMovieListGroupByDate)();
        result.setResultValue(true, result_vm_1.ResultCode.success);
        return c.json(result);
    }
    catch (err) {
        throw err;
    }
});
app.get('/next', async (c) => {
    try {
        const result = new result_vm_1.ResultListGenericVM();
        result.items = await (0, movie_lib_1.getMovieListGroupByDate)('next');
        result.setResultValue(true, result_vm_1.ResultCode.success);
        return c.json(result);
    }
    catch (err) {
        throw err;
    }
});
app.get('/theater', async (c) => {
    try {
        const { cityId } = c.req.query();
        const result = new result_vm_1.ResultListGenericVM();
        result.items = await (0, movie_lib_1.getTheaterList)(cityId);
        result.setResultValue(true, result_vm_1.ResultCode.success);
        return c.json(result);
    }
    catch (err) {
        throw err;
    }
});
app.get('/times/:movieId', async (c) => {
    try {
        const { movieId } = c.req.param();
        const { cityId } = c.req.query();
        const result = new result_vm_1.ResultListGenericVM();
        const { item, items } = await (0, movie_lib_1.getMovieTimes)(movieId, cityId);
        result.item = item;
        result.items = items;
        result.setResultValue(true, result_vm_1.ResultCode.success);
        return c.json(result);
    }
    catch (err) {
        throw err;
    }
});
app.get('/theater/:theaterId', async (c) => {
    try {
        const { theaterId } = c.req.param();
        const { date, cityId } = c.req.query();
        const result = new result_vm_1.ResultListGenericVM();
        const { item, items } = await (0, movie_lib_1.getTheaterTimes)(theaterId, cityId, date);
        result.item = item;
        result.items = items;
        result.setResultValue(true, result_vm_1.ResultCode.success);
        return c.json(result);
    }
    catch (err) {
        throw err;
    }
});
app.get('/vieshow/now', async (c) => {
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
        result.setResultValue(true, result_vm_1.ResultCode.success);
        return c.json(result);
    }
    catch (err) {
        throw err;
    }
});
app.get('/vieshow/coming', async (c) => {
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
        result.setResultValue(true, result_vm_1.ResultCode.success);
        return c.json(result);
    }
    catch (err) {
        throw err;
    }
});
app.get('/vieshow/show-times', async (c) => {
    try {
        const { 'cinema-code': cinemaCode } = c.req.query();
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
        result.setResultValue(true, result_vm_1.ResultCode.success);
        return c.json(result);
    }
    catch (err) {
        throw err;
    }
});
exports.default = app;
//# sourceMappingURL=movie.js.map