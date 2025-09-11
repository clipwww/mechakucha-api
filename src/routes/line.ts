import { Hono } from 'hono';

import { ResultCode, ResultGenericVM } from '../view-models/result.vm';
import { createUserProfile, getUserProfile } from '../libs/line.lib';

const app = new Hono();

app.get('/user/:id', async (c) => {
  try {
    const { id } = c.req.param();
    const result = new ResultGenericVM();

    const user = await getUserProfile(id);

    result.item = user;

    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    throw err;
  }
})

app.post('/user', async (c) => {
  try {
    const { profile } = await c.req.json();
    const result = new ResultGenericVM();

    const user = await createUserProfile(profile);

    result.item = user;

    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    throw err;
  }
})

export default app;