import { Router } from 'express';

import { ResultCode, ResultGenericVM } from '../view-models/result.vm';
import { ResponseExtension } from '../view-models/extension.vm';
import { lruCache, puppeteerUtil, axiosInstance } from '../utilities';
import  moment from 'moment';


const router = Router();

router.get('/', async (req, res: ResponseExtension, next) => {
  try {

    const result = new ResultGenericVM();
    
    const key = 'umamusume';
    const value = lruCache.get(key) as { updateTime: string };

    if (value && moment().isBefore(value.updateTime, 'day')) {
      result.item = value;
    } else {
      const { data: db } = await axiosInstance.get(`https://raw.githubusercontent.com/wrrwrr111/pretty-derby/master/src/assert/db.json`);
      result.item = db;
    }

    res.result = result.setResultValue(true, ResultCode.success)

    next();
  } catch (err) {
    next(err);
  }
})


export default router;