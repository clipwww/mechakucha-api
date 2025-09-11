import { Hono } from 'hono';

import { lruCache } from '../utilities/lru-cache';
import { getBahumutDanmaku } from '../libs/bahamut.lib';
import { ResultCode, ResultListGenericVM, ResultGenericVM } from '../view-models/result.vm';

const app = new Hono();

app.get('/:sn/danmaku', async (c) => {
  try {
    const { sn } = c.req.param();
    const { mode } = c.req.query();

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
      c.header('Content-disposition', `attachment; filename=bahamut-${sn}.json`);
      c.header('Content-type', 'application/json');
      return c.json(result.items, 200);
    }

    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    throw err;
  }
})

export default app;