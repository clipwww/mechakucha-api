import { Router } from 'express';

import { lruCache } from '../utilities/lru-cache';
import { m3u8toStream } from '../libs/convert.lib';
import { getBangumiList, getBangumiEpisode, getBangumiPlayerById } from '../libs/anime1.lib';
import { ResultCode, ResultListGenericVM } from '../view-models/result.vm';
import { ResponseExtension } from '../view-models/extension.vm';

const router = Router();


router.get('/', async (req, res: ResponseExtension, next) => {
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


    res.result = result.setResultValue(true, ResultCode.success);

    next();
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res: ResponseExtension, next) => {
  try {
    const { id } = req.params;
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


    res.result = result.setResultValue(true, ResultCode.success);

    next();
  } catch (err) {
    next(err)
  }
})

router.get('/video/:id/download', async (req, res: ResponseExtension) => {
  const { id } = req.params;

  const { type, url } = await getBangumiPlayerById(id as string);

  if (!url) {
    throw Error('URL Not Found.');
  }

  switch (type) {
    case 'mp4':
      res.redirect(url)
      break;
    case 'm3u8':
      const stream = m3u8toStream(url);

      res.setHeader('Content-disposition', `attachment; filename=${encodeURIComponent(name as string) || +new Date()}.mp4`);
      res.setHeader('Content-type', 'video/mp4');

      stream.pipe(res)
      break;

  }
});


export default router;