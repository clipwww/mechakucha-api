import { Router } from 'express';

import { lruCache } from '../utilities/lru-cache';
import { getBahumutDanmaku } from '../libs/bahamut.lib';
import { ResultCode, ResultListGenericVM, ResultGenericVM } from '../view-models/result.vm';
import { ResponseExtension } from '../view-models/extension.vm';

const router = Router();

router.get('/:sn/danmaku', async (req, res: ResponseExtension, next) => {
  try {
    const { sn } = req.params;
    const { mode } = req.query;

    const result = new ResultListGenericVM();
    const key = `bahamut-danmaku-${sn}`;
    const cacheItems = lruCache.get(key) as any[];
    
    if (cacheItems) {
      result.items = cacheItems
    } else {
      const danmakuList = await getBahumutDanmaku(sn);
      result.items = danmakuList;
      if (result.items.length) {
        lruCache.set(key, result.items)
      }
    }

    if (mode === 'download') {
      res.setHeader('Content-disposition', `attachment; filename=bahamut-${sn}.json`);
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