import { Router } from 'express';

import { lruCache } from '../utilities/lru-cache';
import { getHimawariDougaList, getHimawariDougaDetails, getHimawariDougaDanmaku, getHimawariDanmakuList } from '../libs/himawari.lib';
import { ResultCode, ResultListGenericVM, ResultGenericVM } from '../view-models/result.vm';
import { ResponseExtension } from '../view-models/extension.vm';

const router = Router();

router.get('/', async (req, res: ResponseExtension, next) => {
  try {
    const { sort, keyword, cat, page, mode } = req.query;

    const result = new ResultListGenericVM();
    if (mode === 'commentgroup') {
      const { items, pageInfo  } = await getHimawariDanmakuList(keyword as string, +page)
      result.items = items;
      result.page = pageInfo;
    } else {
      const { channel, items } = await getHimawariDougaList({
        sort: sort as string,
        keyword: keyword as string,
        cat: cat as string,
        page,
      })

      result.item = channel;
      result.items = items;
    }
    

    

    res.result = result.setResultValue(true, ResultCode.success)

    next();
  } catch (err) {
    next(err);
  }
})

router.get('/:id', async (req, res: ResponseExtension, next) => {
  try {
    const { id } = req.params;

    const result = new ResultGenericVM();
    const movieInfo = await getHimawariDougaDetails(id);

    result.item = movieInfo;

    res.result = result.setResultValue(true, ResultCode.success)

    next();
  } catch (err) {
    next(err);
  }
})


/**
 * @api {get} /himawari/:id/danmaku?mode= 取得動畫彈幕
 * @apiName GetHimawariDanmaku
 * @apiGroup 向日葵動畫
 * @apiVersion 1.0.0
 *
 * @apiParam {String} id 向日葵動畫的 Id
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
      "id": "KKc8vr.I2U",
      "no": "286486964",
      "mail": "",
      "vpos": 42,
      "vpos_master": 140,
      "time": 1.4,
      "date": 1596102341,
      "msg": "チー牛絶賛アニメ",
      "text": "チー牛絶賛アニメ",
      "digital_time": "00:01",
      "date_iso_string": "2020-07-30T09:45:41.000Z"
    }
  ]
}
 * 
 */
router.get('/:id/danmaku', async (req, res: ResponseExtension, next) => {
  try {
    const { id } = req.params;
    const { mode, group } = req.query;

    const result = new ResultListGenericVM();
    const key = `himawari-danmaku-${id}`;
    const cacheItems = lruCache.get(key) as any[];
    
    if (cacheItems) {
      result.items = cacheItems
    } else {
      const danmakuList = await getHimawariDougaDanmaku(id, !!group);
      result.items = danmakuList;
      if (result.items.length) {
        lruCache.set(key, result.items)
      }
    }

    if (mode === 'download') {
      res.setHeader('Content-disposition', `attachment; filename=himawari-${id}.json`);
      res.setHeader('Content-type', 'application/json');
      res.write(JSON.stringify(result.items, null, 4),  (err) => {
        if (err) {
          next(err);
        }
        res.status(+ResultCode.success).end();
        return;
      })
      return;
    }

    res.result = result.setResultValue(true, ResultCode.success)

    next();
  } catch (err) {
    next(err);
  }
})


export default router;