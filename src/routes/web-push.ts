import { Router } from 'express';
import  webPush from 'web-push';

import { ResultCode, ResultGenericVM } from '../view-models/result.vm';
import { ResponseExtension } from '../view-models/extension.vm';

const router = Router();

const tokens = [];
webPush.setVapidDetails(
  'mailto:clipwww@gmail.com',
  process.env.WEB_PUSH_PUBLIC_KEY,
  process.env.WEB_PUSH_PRIVATE_KEY
)

router.post('/', async (req, res: ResponseExtension, next) => {
  try {
    const result = new ResultGenericVM();

    if (!req.body) {
      throw Error('paramaters is empty.')
    }
    tokens.push(req.body);

    res.result = result.setResultValue(true, ResultCode.success)

    next();
  } catch (err) {
    next(err);
  }
})

router.get('/', async (req, res: ResponseExtension, next) => {
  try {
    const result = new ResultGenericVM();
    const { title, body, url } = req.query;

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

    res.result = result.setResultValue(true, ResultCode.success)

    next();
  } catch (err) {
    next(err);
  }
})


export default router;