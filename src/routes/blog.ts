import { Hono } from 'hono';

import { lruCache } from '../utilities/lru-cache';
import { ResultCode, ResultGenericVM } from '../view-models/result.vm';
import { addViewCount, getViewCount } from '../libs/blog.lib';

const app = new Hono();

app.get('/post/:id/view-count', async (c) => {
  try {
    const { id } = c.req.param();
    const result = new ResultGenericVM();
    const cacheKey = `${id}-view-count`;

    const cacheValue = lruCache.get(cacheKey);

    if (cacheValue) {
      result.item = cacheValue;
    } else {
      const post = await getViewCount(id)
      result.item = post;
    }

    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    console.log(err)
    throw err;
  }
})

app.post('/post/:id/view-count', async (c) => {
  try {
    const { id } = c.req.param();
    const result = new ResultGenericVM();
    const cacheKey = `${id}-view-count`;

    const post = await addViewCount(id)
    result.item = post;

    lruCache.set(cacheKey, post);

    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    console.log(err)
    throw err;
  }
})

export default app;