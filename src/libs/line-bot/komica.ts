
import { FlexMessage, MessageEvent } from '@line/bot-sdk';

import { getPostListResult } from '../komica.lib';
import { client } from './index';

export async function handleKomicaList(event: MessageEvent, boardType = 'live', page = 1) {
  const { posts } = await getPostListResult(boardType, page);

  return client.replyMessage(event.replyToken, {
    type: "flex",
    altText: 'Komica',
    contents: {
      type: 'carousel',
      contents: posts.slice((page - 1) * 12, page * 12).map((item) => {
        return {
          type: 'bubble',
          size: 'micro',
          hero: {
            type: "image",
            url: item.sImg || 'https://www.fillmurray.com/200/100',
            size: "full",
            aspectMode: 'cover',
            aspectRatio: '200:100',
            backgroundColor: '#000000'
          },
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                weight: 'bold',
                size: 'md',
                text: item.title,
                wrap: true,
              },
            ]
          },
          footer: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "button",
                style: "link",
                action: {
                  type: 'uri',
                  label: '前往',
                  uri: item.url
                },
              }
            ]
          }
        }
      })
    }
  } as FlexMessage)
}