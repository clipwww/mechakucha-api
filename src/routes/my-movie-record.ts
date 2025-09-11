import { Hono } from 'hono';

import { ResultCode, ResultListGenericVM } from '../view-models/result.vm';
import { getMovieLog } from '../libs/google-sheets.lib';

const app = new Hono();

app.get('/', async (c) => {
  try {

    const result = new ResultListGenericVM();

    result.items = await getMovieLog();

    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    throw err;
  }
})

export default app;