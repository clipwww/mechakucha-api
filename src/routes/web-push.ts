import { Hono } from 'hono';
import  webPush from 'web-push';

import { ResultCode, ResultGenericVM } from '../view-models/result.vm';

const app = new Hono();

const tokens = [];
webPush.setVapidDetails(
  'mailto:clipwww@gmail.com',
  process.env.WEB_PUSH_PUBLIC_KEY,
  process.env.WEB_PUSH_PRIVATE_KEY
)

app.post('/', async (c) => {
  try {
    const result = new ResultGenericVM();

    const body = await c.req.json();
    if (!body) {
      throw new Error('paramaters is empty.')
    }
    tokens.push(body);

    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    throw err;
  }
})

app.get('/', async (c) => {
  try {
    const result = new ResultGenericVM();
    const { title, body, url } = c.req.query();

    const sendData = {
      title: title || '安安你好幾歲住哪',
      body: body || '這只是條測試訊息。',
      data: {
        url: url || 'https://clipwww.github.io/blog'
      },
      icon: 'https://clipwww.github.io/blog/favicon.ico',
      // badge: '',
    }
    console.log(tokens)
    const promiseArr = []
    for(let token of tokens) {
      promiseArr.push(
        webPush.sendNotification(token, JSON.stringify(sendData))
      )
    }
    await Promise.all(promiseArr);

    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    throw err;
  }
})

export default app;