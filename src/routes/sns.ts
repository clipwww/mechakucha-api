import { Hono } from 'hono';

import { lruCache } from '../utilities/lru-cache';
import { crawlerFacebookFanPage, crawlerInstagramFanPage, crawlerInstagramHashTag } from '../libs/sns.lib';
import { ResultCode, ResultListGenericVM, ResultGenericVM } from '../view-models/result.vm';

const app = new Hono();

app.get('/fb/:id', async (c) => {
  try {
    const { id } = c.req.param();

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

    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    throw err;
  }
})

app.get('/ig/user/:id', async (c) => {
  try {
    const { id } = c.req.param();

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

    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    throw err;
  }
})

app.get('/ig/hashtag/:tag', async (c) => {
  try {
    const { tag } = c.req.param();
    const { end_cursor = '' } = c.req.query();

    const result = new ResultListGenericVM<any>();

    const { posts, page_info  } = await crawlerInstagramHashTag(tag, end_cursor as string);
    result.items = posts;
    result.item = page_info;

    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    throw err;
  }
})

export default app;