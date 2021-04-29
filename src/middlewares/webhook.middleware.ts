import { WebhookEvent } from '@line/bot-sdk';

import { lineBotMiddleware, handleMessageEvent } from '../libs/line-bot';
import { ResponseExtension } from '../view-models/extension.vm';


export const lineWebhookMiddlewares = [
  lineBotMiddleware,
  (req, res: ResponseExtension) => {

    const handleEventPromise = (req.body.events as WebhookEvent[]).map(event => {
      console.log(event);
      switch(event.type) {
        case 'message':
          return handleMessageEvent(event);
      }

      return 
    })

    Promise.all(handleEventPromise).then(result => {
      res.json(result)
    })

  }
]