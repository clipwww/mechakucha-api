import { Hono } from 'hono';

import { lruCache } from '../utilities/lru-cache';
import { fetchMetaData } from '../libs/meta-fetcher.lib';
import { ResultCode, ResultGenericVM } from '../view-models/result.vm';

const app = new Hono();

app.get('/', async (c) => {
  try {
    const { url } = c.req.query();

    const result = new ResultGenericVM();

    const key = `meta-fetcher-${url}`;
    const cacheValue = lruCache.get(key) as any[];
    if (cacheValue) {
      result.item = cacheValue
    } else {
      result.item = await fetchMetaData(`${url}`);
      lruCache.set(key, result.item)
    }

    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    throw err;
  }
})

export default app;