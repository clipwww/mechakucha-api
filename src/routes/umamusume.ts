import { Router } from 'express';

import { ResultCode, ResultGenericVM } from '../view-models/result.vm';
import { ResponseExtension } from '../view-models/extension.vm';
import { lruCache, puppeteerUtil } from '../utilities';
import * as moment from 'moment';


const router = Router();

router.get('/', async (req, res: ResponseExtension, next) => {
  try {

    const result = new ResultGenericVM();
    
    const key = 'umamusume';
    const value = lruCache.get(key) as { updateTime: string };

    if (value && moment().isBefore(value.updateTime, 'day')) {
      result.item = value;
    } else {
      const page = await puppeteerUtil.newPage();

      await page.goto('http://urarawin.com', {
        waitUntil: 'networkidle0',
      });
      const localStorage = await page.evaluate(() => Object.assign({}, window.localStorage));
      page.close();
  
      const db = JSON.parse(localStorage.db);
      result.item = db;
      lruCache.set(key, db);
    }

    res.result = result.setResultValue(true, ResultCode.success)

    next();
  } catch (err) {
    next(err);
  }
})


export default router;