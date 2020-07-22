import { Router, RequestHandler } from 'express';
import * as moment from 'moment-timezone';

import { sendNotifyMessage, getChatTokens } from '../libs/line.lib';
import { parseXMLtoData } from '../libs/youtube.lib';
import { parseCwbXMLtoItems } from '../libs/cwb.lib';

const router = Router();

const handleGooglePubsubhubbubChallenge: RequestHandler = (req, res) => {
  const query = req.query;
  console.log(query);
  res.status(200).send(query['hub.challenge']);
}

router.get('/yt', handleGooglePubsubhubbubChallenge)
router.get('/cwb', handleGooglePubsubhubbubChallenge)


router.post('/yt', async (req, res) => {
  const xmlString: string = req['rawBody'];

  const entry = parseXMLtoData(xmlString);
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
  }


  res.status(200).send(entry ? 'ok' : '不ok');
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
  }
  
  res.status(200).send(items.length ? 'ok' : '不ok');
})

export default router;
