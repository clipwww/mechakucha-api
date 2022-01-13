import { Router } from 'express';
import  ytDL from 'youtube-dl';

import { lruCache } from '../utilities/lru-cache';
import { axiosInstance } from '../utilities';
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
  const { name } = req.query;

  const { type, url, setCookies } = await getBangumiPlayerById(id as string);

  if (!url) {
    throw Error('URL Not Found.');
  }

  res.setHeader('Content-disposition', `attachment; filename=${name ? encodeURIComponent(name as string) : id}.mp4`);
      res.setHeader('Content-type', 'video/mp4');

  switch (type) {
    case 'mp4':
      const { data, headers } = await axiosInstance.get(url, {
        headers: {
          Cookie: setCookies?.join(';'),
          withCredentials: true,
        },
        responseType: 'stream',
      })
      
      data.pipe(res);
      break;
    case 'm3u8':
      const stream = m3u8toStream(url);

      stream.pipe(res)
      break;
    case 'yt':
      const video = ytDL(url, ['--format=18'], { cwd: __dirname });

      video.pipe(res)
      break;
  }
});


export default router;