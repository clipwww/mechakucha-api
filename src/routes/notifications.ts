import { Router, RequestHandler } from 'express';
import * as moment from 'moment-timezone';
import fetch from 'node-fetch';
import * as FormData from 'form-data';

import { sendNotifyMessage, getChatTokens } from '../libs/line.lib';
import { parseXMLtoData } from '../libs/youtube.lib';
import { parseCwbXMLtoItems } from '../libs/cwb.lib';
import { ResultCode } from '../view-models/result.vm';

const router = Router();

const subscribe = async (callback: string, topic: string): Promise<boolean> => {
  try {
    const formData = new FormData();
    const hub = {
      callback,
      topic,
      verify: 'async',
      mode: 'subscribe',
      verify_token: '',
      secret: '',
      lease_seconds: '', 
    }

    for (const key in hub) {
      formData.append(`hub.${key}`, hub[key]);
    }

    const response = await fetch(`https://pubsubhubbub.appspot.com/subscribe`, {
      method: 'POST',
      body: formData,
    })

    return true;
  } catch (err) {
    console.error(err.message);
    return false;
  }
}



const handleGooglePubsubhubbubChallenge: RequestHandler = (req, res) => {
  const query = req.query;
  console.log(query);
  res.status(+ResultCode.success).send(query['hub.challenge']);
}

router.get('/yt', handleGooglePubsubhubbubChallenge)
router.get('/cwb', handleGooglePubsubhubbubChallenge)


router.post('/yt', async (req, res) => {
  const xmlString: string = req['rawBody'];

  const { entry, self } = parseXMLtoData(xmlString);
  console.log('entry', entry)
  if (entry) {
    const tokens = await getChatTokens();
    tokens.map(token => sendNotifyMessage(token, {
      message: `
${entry.author.name} 發布了新的影片！
影片標題: ${entry.title}
影片連結: ${entry.link.href}
發布時間: ${moment(entry.published).format('YYYY/MM/DD HH:mm')}
      `,
      // imageFullsize: `https://img.youtube.com/vi/${entry["yt:videoId"]}/maxresdefault.jpg`,
      // imageThumbnail: `https://img.youtube.com/vi/${entry["yt:videoId"]}/default.jpg`
    }))

    subscribe(`${req.protocol}://${req.hostname}${req.originalUrl}`, self);
  }


  res.status(+ResultCode.success).send(entry ? 'ok' : '不ok');
})

router.post('/cwb', async (req, res) => {
  const xmlString: string = req['rawBody'];

  const items = parseCwbXMLtoItems(xmlString);

  if (items.length) {
    const tokens = await getChatTokens();
    items.forEach(item => {
      tokens.map(token => sendNotifyMessage(token, {
        message: `
中央氣象局警報、特報
${item.title}
${item.description.replace(/\\n/g, '\n')}
${item.link}
        `,
      }))
    })

    console.log(req.hostname);
    subscribe(`${req.protocol}://${req.hostname}${req.originalUrl}`, 'https://www.cwb.gov.tw/rss/Data/cwb_warning.xml');
  }
  
  res.status(+ResultCode.success).send(items.length ? 'ok' : '不ok');
})

export default router;
