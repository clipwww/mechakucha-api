import { Router } from 'express';

import { lruCache } from '../utilities/lru-cache';
import { fetchMetaData } from '../libs/meta-fetcher.lib';
import { ResultCode, ResultGenericVM } from '../view-models/result.vm';
import { ResponseExtension } from '../view-models/extension.vm';

const router = Router();

router.get('/', async (req, res: ResponseExtension, next) => {
  try {
    const { url } = req.query;

    const result = new ResultGenericVM();

    const key = `meta-fetcher-${url}`;
    const cacheValue = lruCache.get(key) as any[];
    if (cacheValue) {
      result.item = cacheValue
    } else {
      result.item = await fetchMetaData(`${url}`);
      lruCache.set(key, result.item)
    }

    res.result = result.setResultValue(true, ResultCode.success);

    next();
  } catch (err) {
    next(err)
  }
})


export default router;