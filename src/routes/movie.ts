import { Router } from 'express';

import { searchMovieRating, getCityList, getMovieList, getMovieListGroupByDate, getTheaterList, getMovieTimes, getTheaterTimes } from '../libs/movie.lib';
import { ResultCode, ResultListGenericVM } from '../view-models/result.vm';
import { ResponseExtension } from '../view-models/extension.vm';

const router = Router();

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
      "year": "108",
      "ratingId": "局影外字第108528號",
      "title": "《少女與戰車 總集篇4DX》-第63屆戰車道全國高中生大會",
      "country": "日本",
      "runtime": "2時2分1秒",
      "rating": "普遍級"
    },
  ]
}
 * 
 */
router.get('/rating', async (req, res: ResponseExtension, next) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      next();
    }

    const result = new ResultListGenericVM();

    result.items = await searchMovieRating(keyword as string);
    res.result = result.setResultValue(true, ResultCode.success);


    next();
  } catch (err) {
    next(err);
  }
})

router.get('/city', async (req, res: ResponseExtension, next) => {
  try {
    const result = new ResultListGenericVM();
    result.items = await getCityList();

    res.result = result.setResultValue(true, ResultCode.success);
    next();
  } catch (err) {
    next(err);
  }
});

router.get('/list', async (req, res: ResponseExtension, next) => {
  try {
    const result = new ResultListGenericVM();
    result.items = await getMovieList();

    res.result = result.setResultValue(true, ResultCode.success);
    next();
  } catch (err) {
    next(err);
  }
});

router.get('/list-group-by-date', async (req, res: ResponseExtension, next) => {
  try {
    const result = new ResultListGenericVM();
    result.items = await getMovieListGroupByDate();

    res.result = result.setResultValue(true, ResultCode.success);
    next();
  } catch (err) {
    next(err);
  }
});

router.get('/next', async (req, res: ResponseExtension, next) => {
  try {
    const result = new ResultListGenericVM();
    result.items = await getMovieListGroupByDate('next');

    res.result = result.setResultValue(true, ResultCode.success);
    next();
  } catch (err) {
    next(err);
  }
});

router.get('/theater', async (req, res: ResponseExtension, next) => {
  try {
    const { cityId } = req.query;
    const result = new ResultListGenericVM();
    result.items = await getTheaterList(cityId as string);

    res.result = result.setResultValue(true, ResultCode.success);
    next();
  } catch (err) {
    next(err);
  }
});

router.get('/times/:movieId', async (req, res: ResponseExtension, next) => {
  try {
    const { movieId } = req.params
    const { cityId } = req.query;
    const result = new ResultListGenericVM();
    const { item, items } = await getMovieTimes(movieId, cityId as string);

    result.item = item;
    result.items = items;

    res.result = result.setResultValue(true, ResultCode.success);
    next();
  } catch (err) {
    next(err);
  }
});

router.get('/theater/:theaterId', async (req, res: ResponseExtension, next) => {

  try {
    const { theaterId } = req.params;
    const { date, cityId } = req.query;
    const result = new ResultListGenericVM();
    const { item, items } = await getTheaterTimes(theaterId, cityId as string, date as string);

    result.item = item;
    result.items = items;

    res.result = result.setResultValue(true, ResultCode.success);
    next();
  } catch (err) {
    next(err);
  }
});

export default router;