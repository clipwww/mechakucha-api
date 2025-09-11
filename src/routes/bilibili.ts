import { Hono } from 'hono';

import { lruCache } from '../utilities/lru-cache';
import { getBiliBiliDanmaku } from '../libs/bilibili.lib';
import { ResultCode, ResultListGenericVM, ResultGenericVM } from '../view-models/result.vm';

const app = new Hono();

app.get('/:id/danmaku', async (c) => {
  try {
    const { id } = c.req.param();
    const { mode } = c.req.query();

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
      c.header('Content-disposition', `attachment; filename=bilibili-${id}.json`);
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