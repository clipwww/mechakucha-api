import { Router } from 'express';

import { lruCache } from '../utilities/lru-cache';
import { ResultCode, ResultGenericVM } from '../view-models/result.vm';
import { ResponseExtension } from '../view-models/extension.vm';
import { addViewCount, getViewCount } from '../libs/blog.lib';

const router = Router();

router.get('/post/:id/view-count', async (req, res: ResponseExtension, next) => {
  try {
    const { id } = req.params;
    const result = new ResultGenericVM();
    const cacheKey = `${id}-view-count`;

    const cacheValue = lruCache.get(cacheKey);

    if (cacheValue) {
      result.item = cacheValue;
    } else {
      const post = await getViewCount(id)
      result.item = post;
    }

    res.result = result.setResultValue(true, ResultCode.success)

    next();
  } catch (err) {
    console.log(err)
    next(err);
  }
})

router.post('/post/:id/view-count', async (req, res: ResponseExtension, next) => {
  try {
    const { id } = req.params;
    const result = new ResultGenericVM();
    const cacheKey = `${id}-view-count`;

    const post = await addViewCount(id)
    result.item = post;

    lruCache.set(cacheKey, post);

    res.result = result.setResultValue(true, ResultCode.success)

    next();
  } catch (err) {
    console.log(err)
    next(err);
  }
})

export default router;