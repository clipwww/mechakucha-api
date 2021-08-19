import { Router } from 'express';

import { ResultCode, ResultListGenericVM } from '../view-models/result.vm';
import { ResponseExtension } from '../view-models/extension.vm';
import { getMovieLog, getMiLog } from '../libs/google-sheets.lib';

const router = Router();

router.get('/movie', async (req, res: ResponseExtension, next) => {
  try {
    const result = new ResultListGenericVM();

    result.items = await getMovieLog();

    res.result = result.setResultValue(true, ResultCode.success)

    next();
  } catch (err) {
    next(err);
  }
})

router.get('/mi/:type', async (req, res: ResponseExtension, next) => {
  try {
    const { type } = req.params;

    const result = new ResultListGenericVM();


    result.items = await getMiLog(type);

    res.result = result.setResultValue(true, ResultCode.success)

    next();
  } catch (err) {
    next(err);
  }
})



export default router;