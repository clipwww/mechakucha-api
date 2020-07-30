import { Router } from 'express';

import { lruCache } from '../utilities/lru-cache';
import { getAnimeList, getAnimeDetails, getAnimeVideo, queryAnimeList } from '../libs/agefans.lib';
import { ResultCode, ResultListGenericVM, ResultGenericVM } from '../view-models/result.vm';
import { ResponseExtension } from '../view-models/extension.vm';

const router = Router();

router.get('/', async (req, res: ResponseExtension, next) => {
  try {
    const { keyword } = req.query;

    const result = new ResultListGenericVM();

    const key = `agefans-list-${keyword}`;
    const cacheItems = lruCache.get(key) as any[];
    if (cacheItems) {
      result.items = cacheItems
    } else {
      result.items = keyword ? await queryAnimeList(keyword as string) : await getAnimeList();
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
    const result = new ResultGenericVM();

    const key = `agefans-details-${id}`;
    const cacheItem = lruCache.get(key);

    if (cacheItem) {
      result.item = cacheItem;
    } else {
      result.item = await getAnimeDetails(id);
      lruCache.set(key, result.item)
    }

    res.result = result.setResultValue(true, ResultCode.success);

    next();
  } catch (err) {
    next(err);
  }
})

router.get('/:id/:pId/:eId', async (req, res: ResponseExtension) => {
  const { id, pId, eId } = req.params;

    const key = `agefans-video-${id}-${pId}-${eId}`;
    const cacheVideoUrl = lruCache.get(key) as string;

    const videoUrl = cacheVideoUrl || await getAnimeVideo(id, pId, eId);
    if (videoUrl) {
      lruCache.set(key, videoUrl)
    }

    res.redirect(videoUrl);
})

export default router;