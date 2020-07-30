import { Router } from 'express';

import { getHimawariDougaList, getHimawariDougaDetails, getHimawariDougaDanmaku } from '../libs/himawari.lib';
import { ResultCode, ResultListGenericVM, ResultGenericVM } from '../view-models/result.vm';
import { ResponseExtension } from '../view-models/extension.vm';

const router = Router();

router.get('/', async (req, res: ResponseExtension, next) => {
  try {
    const { sort, keyword, cat, page } = req.query;

    const result = new ResultListGenericVM();
    const { channel, items } = await getHimawariDougaList({
      sort: sort as string,
      keyword: keyword as string,
      cat: cat as string,
      page,
    })

    result.item = channel;
    result.items = items;

    res.result = result.setResultValue(true, ResultCode.success)

    next();
  } catch (err) {
    next(err);
  }
})

router.get('/:id', async (req, res: ResponseExtension, next) => {
  try {
    const { id } = req.params;

    const result = new ResultGenericVM();
    const movieInfo = await getHimawariDougaDetails(id);

    result.item = movieInfo;

    res.result = result.setResultValue(true, ResultCode.success)

    next();
  } catch (err) {
    next(err);
  }
})

router.get('/:id/danmaku', async (req, res: ResponseExtension, next) => {
  try {
    const { id } = req.params;

    const result = new ResultListGenericVM();
    const danmakuList = await getHimawariDougaDanmaku(id);

    result.items = danmakuList;

    res.result = result.setResultValue(true, ResultCode.success)

    next();
  } catch (err) {
    next(err);
  }
})


export default router;