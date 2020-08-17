import { Router } from 'express';

import { lruCache } from '../utilities/lru-cache';
import { getBiliBiliDanmaku } from '../libs/bilibili.lib';
import { ResultCode, ResultListGenericVM, ResultGenericVM } from '../view-models/result.vm';
import { ResponseExtension } from '../view-models/extension.vm';

const router = Router();

router.get('/:id/danmaku', async (req, res: ResponseExtension, next) => {
  try {
    const { id } = req.params;
    const { mode } = req.query;

    const result = new ResultListGenericVM();
    const key = `bilibili-danmaku-${id}`;
    const cacheItems = lruCache.get(key) as any[];
    
    if (cacheItems) {
      result.items = cacheItems
    } else {
      const danmakuList = await getBiliBiliDanmaku(id);
      result.items = danmakuList;
      if (result.items.length) {
        lruCache.set(key, result.items)
      }
    }

    if (mode === 'download') {
      res.setHeader('Content-disposition', `attachment; filename=bilibili-${id}.json`);
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