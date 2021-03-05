import { Router } from 'express';

import { ResultCode, ResultGenericVM } from '../view-models/result.vm';
import { ResponseExtension } from '../view-models/extension.vm';
import { axiosInstance, lruCache } from '../utilities';


const router = Router();

router.get('/', async (req, res: ResponseExtension, next) => {
  try {

    const result = new ResultGenericVM();

    const { data: { updateTime } } = await axiosInstance.get('http://urarawin.com/dbd');
    const value = lruCache.get(updateTime);

    if (value) {
      result.item = value;
    } else {
      const { data } = await axiosInstance.get('http://urarawin.com/db');
      result.item = data;
      lruCache.set(data.updateTime, data);
    }

    res.result = result.setResultValue(true, ResultCode.success)

    next();
  } catch (err) {
    next(err);
  }
})


export default router;