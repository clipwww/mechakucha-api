import { Router } from 'express';

import { lruCache } from '../utilities/lru-cache';
import { crawlerFacebookFanPage, crawlerInstagramFanPage, crawlerInstagramHashTag } from '../libs/sns.lib';
import { ResultCode, ResultListGenericVM, ResultGenericVM } from '../view-models/result.vm';
import { ResponseExtension } from '../view-models/extension.vm';

const router = Router();

router.get('/fb/:id', async (req, res: ResponseExtension, next) => {
  try {
    const { id } = req.params;

    const result = new ResultGenericVM<{
      id: string;
      name: string;
      logo: string;
      posts: any[];
    }>();

    const key = `fb-${id}`;
    const cacheValue = lruCache.get(key);
    if (cacheValue) {
      result.item = cacheValue as any;
    } else {
      result.item = await crawlerFacebookFanPage(id);

      lruCache.set(key, result.item)
    }


    res.result = result.setResultValue(true, ResultCode.success);

    next();
  } catch (err) {
    next(err)
  }
})

router.get('/ig/user/:id', async (req, res: ResponseExtension, next) => {
  try {
    const { id } = req.params;

    const result = new ResultListGenericVM<{
      href: string;
      src: string;
    }>();

    const key = `ig-user-${id}`;
    const cacheValue = lruCache.get(key);
    if (cacheValue) {
      result.items = cacheValue as any;
    } else {
      result.items = await crawlerInstagramFanPage(id);

      lruCache.set(key, result.items)
    }


    res.result = result.setResultValue(true, ResultCode.success);

    next();
  } catch (err) {
    next(err)
  }
})

router.get('/ig/hashtag/:tag', async (req, res: ResponseExtension, next) => {
  try {
    const { tag } = req.params;
    const { end_cursor = '' } = req.query;

    const result = new ResultListGenericVM<any>();

    const { posts, page_info  } = await crawlerInstagramHashTag(tag, end_cursor as string);
    result.items = posts;
    result.item = page_info; 


    res.result = result.setResultValue(true, ResultCode.success);

    next();
  } catch (err) {
    next(err)
  }
})

export default router;