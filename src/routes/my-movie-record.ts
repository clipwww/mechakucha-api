import { Router } from 'express';

import { ResultCode, ResultListGenericVM } from '../view-models/result.vm';
import { ResponseExtension } from '../view-models/extension.vm';
import { getMovieLog } from '../libs/google-sheets.lib';

const router = Router();

router.get('/', async (req, res: ResponseExtension, next) => {
  try {

    const result = new ResultListGenericVM();

    
    result.items = await getMovieLog();

    res.result = result.setResultValue(true, ResultCode.success)

    next();
  } catch (err) {
    next(err);
  }
})


export default router;