import { Hono } from 'hono';

import { ResultCode, ResultListGenericVM } from '../view-models/result.vm';
import { getMovieLog, getMiLog } from '../libs/google-sheets.lib';

const app = new Hono();

app.get('/movie', async (c) => {
  try {
    const result = new ResultListGenericVM();

    result.items = await getMovieLog();

    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    throw err;
  }
})

app.get('/mi/:type', async (c) => {
  try {
    const { type } = c.req.param();

    const result = new ResultListGenericVM();

    result.items = await getMiLog(type);

    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    throw err;
  }
})

export default app;