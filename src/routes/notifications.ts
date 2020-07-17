import { Router } from 'express';
import * as moment from 'moment-timezone';

import { sendNotifyMessage, getChatTokens } from '../libs/line.lib';
import { parseXMLtoData } from '../libs/youtube.lib';

const router = Router();

router.get('/yt', (req, res) => {
  const query = req.query;
  console.log(query);
  res.status(200).send(query['hub.challenge']);
})


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

export default router;