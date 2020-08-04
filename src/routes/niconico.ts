import { Router } from 'express';

import { lruCache } from '../utilities/lru-cache';
import { getNicoNicoDanmaku } from '../libs/niconico.lib';
import { ResultCode, ResultListGenericVM, ResultGenericVM } from '../view-models/result.vm';
import { ResponseExtension } from '../view-models/extension.vm';

const router = Router();

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
router.get('/:id/danmaku', async (req, res: ResponseExtension, next) => {
  try {
    const { id } = req.params;
    const { mode } = req.query;

    const result = new ResultListGenericVM();
    const key = `niconico-danmaku-${id}`;
    const cacheItems = lruCache.get(key) as any[];
    
    if (cacheItems) {
      result.items = cacheItems
    } else {
      const danmakuList = await getNicoNicoDanmaku(id);
      result.items = danmakuList;
      lruCache.set(key, result.items)
    }

    if (mode === 'download') {
      res.setHeader('Content-disposition', `attachment; filename=niconico-${id}.json`);
      res.setHeader('Content-type', 'application/json');
      res.write(JSON.stringify(result.items, null, 4),  (err) => {
        if (err) {
          next(err);
        }
        res.status(+ResultCode.success).end();
        return;
      })
    }

    res.result = result.setResultValue(true, ResultCode.success)

    next();
  } catch (err) {
    next(err);
  }
})


export default router;