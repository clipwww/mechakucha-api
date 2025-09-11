import { Hono } from 'hono';
// import  ytDL from 'youtube-dl';

import { lruCache } from '../utilities/lru-cache';
import { axiosInstance } from '../utilities';
import { m3u8toStream } from '../libs/convert.lib';
import { getBangumiList, getBangumiEpisode, getBangumiPlayerById } from '../libs/anime1.lib';
import { ResultCode, ResultListGenericVM } from '../view-models/result.vm';

const app = new Hono();


app.get('/', async (c) => {
  try {

    const result = new ResultListGenericVM();

    const key = `anime1-list`;
    const cacheItems = lruCache.get(key) as any[];
    if (cacheItems) {
      result.items = cacheItems
    } else {
      result.items = await getBangumiList();
      lruCache.set(key, result.items)
    }

    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    throw err;
  }
})

app.get('/:id', async (c) => {
  try {
    const { id } = c.req.param();
    const result = new ResultListGenericVM();

    const key = `anime1-${id}`;
    const cacheValue = lruCache.get(key) as any[];

    if (cacheValue) {
      // @ts-ignore
      const { item, items } = cacheValue;
      result.item = item;
      result.items = items;
    } else {
      const { title, items } = await getBangumiEpisode(id);
      result.items = items;
      result.item = {
        id,
        title
      }
      lruCache.set(key, {
        items: result.items,
        item: result.item
      })
    }

    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    throw err;
  }
})

app.get('/video/:id/download', async (c) => {
  const { id } = c.req.param();
  const { name } = c.req.query();

  const { type, url, setCookies } = await getBangumiPlayerById(id as string);

  if (!url) {
    throw new Error('URL Not Found.');
  }

  c.header('Content-disposition', `attachment; filename=${name ? encodeURIComponent(name as string) : id}.mp4`);
  c.header('Content-type', 'video/mp4');

  // 臨時：返回簡單響應，稍後改進流處理
  return c.text('Video download in progress...', 200);
});


export default app;