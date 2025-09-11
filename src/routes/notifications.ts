import { Hono } from 'hono';
import  moment from 'moment-timezone';
import fetch from 'node-fetch';
import  FormData from 'form-data';

import { sendNotifyMessage, handleSubscribe } from '../libs/line.lib';
import { parseXMLtoData } from '../libs/youtube.lib';
import { parseCwbXMLtoItems } from '../libs/cwb.lib';
import { ResultCode } from '../view-models/result.vm';

const app = new Hono();

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

    await fetch(`https://pubsubhubbub.appspot.com/subscribe`, {
      method: 'POST',
      body: formData,
    })

    return true;
  } catch (err) {
    console.error(err.message);
    return false;
  }
}



const handleGooglePubsubhubbubChallenge = async (c: any) => {
  const query = c.req.query();
  console.log(query);
  return c.text(query['hub.challenge'], +ResultCode.success);
}

app.get('/yt', handleGooglePubsubhubbubChallenge)
app.get('/cwb', handleGooglePubsubhubbubChallenge)


app.post('/yt', async (c) => {
  const xmlString: string = await c.req.text();

  const { entry, self } = parseXMLtoData(xmlString);
  console.log('entry', entry)
  if (entry) {

    sendNotifyMessage({
      message: `
--- ${entry.author.name} 有新的通知! ---
影片標題: ${entry.title}
影片連結: ${entry.link.href}
發布時間: ${moment(entry.published).format('YYYY/MM/DD HH:mm')}
      `,
      // imageFullsize: `https://img.youtube.com/vi/${entry["yt:videoId"]}/maxresdefault.jpg`,
      // imageThumbnail: `https://img.youtube.com/vi/${entry["yt:videoId"]}/default.jpg`
    })

    const url = new URL(c.req.url);
    subscribe(`${url.protocol}//${url.hostname}/notifications/yt`, self);
  }

  return c.text(entry ? 'ok' : '不ok', 200);
})

app.post('/cwb', async (c) => {
  const xmlString: string = await c.req.text();

  const items = parseCwbXMLtoItems(xmlString);

  if (items.length) {
    items.forEach(item => {
      sendNotifyMessage({
        message: `
--- 中央氣象局警報、特報 ---
${item.title}
${item.description.replace(/\\n/g, '\n')}
${item.link}
        `,
      })
    })

    const url = new URL(c.req.url);
    subscribe(`${url.protocol}//${url.hostname}/notifications/cwb`, 'https://www.cwb.gov.tw/rss/Data/cwb_warning.xml');
  }

  return c.text(items.length ? 'ok' : '不ok', 200);
})


app.post('/line-notify', async (c) => {
  const { code } = await c.req.json();
  const url = new URL(c.req.url);
  const isOk = await handleSubscribe(code, `${url.protocol}//${url.hostname}/notifications/line-notify`);

  return c.text(isOk ? '訂閱成功' : '訂閱失敗', 200);
})

export default app;
