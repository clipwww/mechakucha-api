import { Hono } from 'hono';

import { ResultCode, ResultGenericVM } from '../view-models/result.vm';
import { lruCache, axiosInstance } from '../utilities';
import  moment from 'moment';

const app = new Hono();

app.get('/', async (c) => {
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

    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    throw err;
  }
})

export default app;