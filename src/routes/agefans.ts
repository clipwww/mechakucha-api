import { Router } from 'express';

import { getAnimeList, getAnimeDetails, getAnimeVideo, queryAnimeList } from  '../libs/agefans.lib';
import { ResultCode, ResultListGenericVM, ResultGenericVM } from '../view-models/result.vm';
import { ResponseExtension } from '../view-models/extension.vm';

const router = Router();

router.get('/', async (req, res: ResponseExtension, next) => {
  const { keyword } = req.query;

  const result = new ResultListGenericVM();
  result.items = keyword ? await queryAnimeList(keyword as string) : await getAnimeList();

  res.result = result.setResultValue(true, ResultCode.success);

  next();
})

router.get('/:id', async (req, res: ResponseExtension, next) => {
  const { id } = req.params;
  const result = new ResultGenericVM();
  result.item = await getAnimeDetails(id);

  res.result = result.setResultValue(true, ResultCode.success);

  next();
})

router.get('/:id/:pId/:eId', async (req, res: ResponseExtension) => {
  const { id, pId, eId } = req.params;
  const videoUrl = await getAnimeVideo(id, pId, eId);

  res.redirect(videoUrl);
})

export default router;