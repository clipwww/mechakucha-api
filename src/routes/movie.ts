import { Hono } from 'hono';

import { lruCache } from '../utilities/lru-cache';
import { searchMovieRating, getCityList, getMovieList, getMovieListGroupByDate, getTheaterList, getMovieTimes, getTheaterTimes, searchMovieRatingDetails, getVieShowComingMovieList, getVieShowNowMovieList, getVieShowMovieShowTimes } from '../libs/movie.lib';
import { ResultCode, ResultGenericVM, ResultListGenericVM } from '../view-models/result.vm';
import { MovieRatingModel } from '../nosql/models/movie.model'
import { sendNotifyMessage } from '../libs/line.lib';

const app = new Hono();
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
    keyword = keyword ? `${keyword}` : ''

    const result = new ResultListGenericVM();

    const items = await searchMovieRating(keyword);
    result.items = items;
    result.setResultValue(true, ResultCode.success);

    const key = `movie-rating-${keyword}`;
    const cacheValue =  lruCache.get(key) as any[];
    if (cacheValue?.[0]?.no !== items?.[0]?.no && keyword.includes('戰車')) {
      items.forEach(async item => {
        const movieDoc = await MovieRatingModel.findOne({ no: item.no })
        if (!movieDoc) {
          const { id, ...other } = item;
          await MovieRatingModel.create(other);
          sendNotifyMessage({
            message: `
--- 電影分級查詢結果: "${keyword}" ---
找到一筆新的資料: ${item.title}
            `
          })
        }
      })
      lruCache.set(key, items, 1000 * 60 * 60 * 24 * 30)
    }

    return c.json(result);
  } catch (err) {
    throw err;
  }
})

app.get('/rating/:certificateNumber', async (c) => {
  try {
    let { certificateNumber } = c.req.param();
    if (!certificateNumber) {
      throw Error('parameters is empty')
    }
    const key = `movie-rating-details-${certificateNumber}`;

    const result = new ResultGenericVM();
    const cacheValue =  lruCache.get(key)

    if (cacheValue) {
      result.item = cacheValue
    } else {
      result.item = await searchMovieRatingDetails(certificateNumber); 
    }

    result.setResultValue(true, ResultCode.success);

    lruCache.set(key, result.item, 1000 * 60 * 60 * 24 * 30)
    
    return c.json(result);
  } catch (err) {
    throw err;
  }
})

app.get('/city', async (c) => {
  try {
    const result = new ResultListGenericVM();
    result.items = await getCityList();

    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    throw err;
  }
});

app.get('/list', async (c) => {
  try {
    const result = new ResultListGenericVM();
    result.items = await getMovieList();

    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    throw err;
  }
});

app.get('/list-group-by-date', async (c) => {
  try {
    const result = new ResultListGenericVM();
    result.items = await getMovieListGroupByDate();

    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    throw err;
  }
});

app.get('/next', async (c) => {
  try {
    const result = new ResultListGenericVM();
    result.items = await getMovieListGroupByDate('next');

    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    throw err;
  }
});

app.get('/theater', async (c) => {
  try {
    const { cityId } = c.req.query();
    const result = new ResultListGenericVM();
    result.items = await getTheaterList(cityId as string);

    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    throw err;
  }
});

app.get('/times/:movieId', async (c) => {
  try {
    const { movieId } = c.req.param()
    const { cityId } = c.req.query();
    const result = new ResultListGenericVM();
    const { item, items } = await getMovieTimes(movieId, cityId as string);

    result.item = item;
    result.items = items;

    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    throw err;
  }
});

app.get('/theater/:theaterId', async (c) => {

  try {
    const { theaterId } = c.req.param();
    const { date, cityId } = c.req.query();
    const result = new ResultListGenericVM();
    const { item, items } = await getTheaterTimes(theaterId, cityId as string, date as string);

    result.item = item;
    result.items = items;

    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    throw err;
  }
});

app.get('/vieshow/now', async (c) => {

  try {
    const result = new ResultListGenericVM();
    
    const key = `movie-vieshow-now`;

    const cacheValue =  lruCache.get(key) as any[]

    if (cacheValue) {
      result.items = cacheValue
    } else {
      const movieList = await getVieShowNowMovieList();
      result.items = movieList;

      lruCache.set(key, movieList, 1000 * 60 * 60 * 2)
    }
    
    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    throw err;
  }
});


app.get('/vieshow/coming', async (c) => {

  try {
    const result = new ResultListGenericVM();
    
    const key = `movie-vieshow-coming`;

    const cacheValue =  lruCache.get(key) as any[]

    if (cacheValue) {
      result.items = cacheValue
    } else {
      const movieList = await getVieShowComingMovieList();
      result.items = movieList;

      lruCache.set(key, movieList, 1000 * 60 * 60 * 2)
    }
    
    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    throw err;
  }
});

app.get('/vieshow/show-times', async (c) => {

  try {
    const { 'cinema-code': cinemaCode } = c.req.query()
    const result = new ResultListGenericVM();

    if (!cinemaCode) {
      throw new Error('cinema-code is empty.')
    }
    
    const key = `movie-vieshow-show-times-${cinemaCode}`;

    const cacheValue =  lruCache.get(key) as any[]

    if (cacheValue) {
      result.items = cacheValue
    } else {
      const movieList = await getVieShowMovieShowTimes(cinemaCode as string);
      result.items = movieList;

      lruCache.set(key, movieList, 1000 * 60 * 5)
    }
    
    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    throw err;
  }
});

export default app;