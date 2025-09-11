import { OpenAPIHono } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import  moment from 'moment-timezone';
import fetch from 'node-fetch';
import  FormData from 'form-data';

import { sendNotifyMessage, handleSubscribe } from '../libs/line.lib';
import { parseXMLtoData } from '../libs/youtube.lib';
import { parseCwbXMLtoItems } from '../libs/cwb.lib';
import { ResultCode } from '../view-models/result.vm';

const app = new OpenAPIHono();

// Zod schemas for API documentation
const PubSubChallengeQuerySchema = z.object({
  'hub.challenge': z.string().openapi({
    example: 'challenge_token_123',
    description: 'PubSubHubbub challenge token'
  }),
  'hub.mode': z.string().optional().openapi({
    example: 'subscribe',
    description: 'Subscription mode'
  }),
  'hub.topic': z.string().optional().openapi({
    example: 'https://www.youtube.com/xml/feeds/videos.xml?channel_id=UC123',
    description: 'Topic URL'
  }),
  'hub.verify_token': z.string().optional().openapi({
    example: 'verify_token_123',
    description: 'Verification token'
  })
}).openapi('PubSubChallengeQuery');

const LineNotifyRequestSchema = z.object({
  code: z.string().openapi({
    example: 'authorization_code_123',
    description: 'LINE Notify authorization code'
  })
}).openapi('LineNotifyRequest');

const TextResponseSchema = z.string().openapi({
  example: 'ok',
  description: 'Simple text response'
});

// Routes with OpenAPI documentation
const ytChallengeRoute = createRoute({
  method: 'get',
  path: '/yt',
  summary: 'YouTube PubSubHubbub Challenge Handler',
  description: 'Handles Google PubSubHubbub challenge verification for YouTube notifications',
  tags: ['工具服務'],
  request: {
    query: PubSubChallengeQuerySchema
  },
  responses: {
    200: {
      description: 'Challenge response for PubSubHubbub verification'
    }
  }
});

const cwbChallengeRoute = createRoute({
  method: 'get',
  path: '/cwb',
  summary: 'CWB PubSubHubbub Challenge Handler',
  description: 'Handles Google PubSubHubbub challenge verification for Central Weather Bureau notifications',
  tags: ['工具服務'],
  request: {
    query: PubSubChallengeQuerySchema
  },
  responses: {
    200: {
      description: 'Challenge response for PubSubHubbub verification'
    }
  }
});

const ytNotificationRoute = createRoute({
  method: 'post',
  path: '/yt',
  summary: 'YouTube Notification Handler',
  description: 'Processes YouTube video notification updates via PubSubHubbub',
  tags: ['工具服務'],
  request: {
    body: {
      content: {
        'application/xml': {
          schema: z.string().openapi({
            example: '<?xml version="1.0"?><feed>...</feed>',
            description: 'XML notification data from YouTube'
          })
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Notification processing result'
    }
  }
});

const cwbNotificationRoute = createRoute({
  method: 'post',
  path: '/cwb',
  summary: 'CWB Notification Handler',
  description: 'Processes Central Weather Bureau alert notifications via PubSubHubbub',
  tags: ['工具服務'],
  request: {
    body: {
      content: {
        'application/xml': {
          schema: z.string().openapi({
            example: '<?xml version="1.0"?><rss>...</rss>',
            description: 'XML notification data from CWB'
          })
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Notification processing result'
    }
  }
});

const lineNotifyRoute = createRoute({
  method: 'post',
  path: '/line-notify',
  summary: 'LINE Notify Subscription Handler',
  description: 'Handles LINE Notify authorization code and completes subscription setup',
  tags: ['工具服務'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: LineNotifyRequestSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Subscription setup result'
    }
  }
});

const subscribe = async (callback: string, topic: string): Promise<boolean> => {
  try {
    const formData = new FormData();
    const hub: Record<string, string> = {
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
    console.error(err instanceof Error ? err.message : String(err));
    return false;
  }
}



const handleGooglePubsubhubbubChallenge = async (c: any) => {
  const query = c.req.query();
  console.log(query);
  return c.text(query['hub.challenge'], +ResultCode.success);
}

app.openapi(ytChallengeRoute, handleGooglePubsubhubbubChallenge);
app.openapi(cwbChallengeRoute, handleGooglePubsubhubbubChallenge);


app.openapi(ytNotificationRoute, async (c) => {
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
