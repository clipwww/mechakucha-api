
import { FlexBubble, FlexMessage, MessageEvent } from '@line/bot-sdk';

import { getRankingList } from '../niconico.lib';
import { client } from './index';

export async function handleNicoRankList(event: MessageEvent, page = 1) {
  const items = await getRankingList();

  return client.replyMessage(event.replyToken, {
    type: "flex",
    altText: 'Nico排行',
    contents: {
      type: 'carousel',
      contents: items.slice((page - 1) * 12, page * 12).map(item => {
        return {
          type: 'bubble',
          size: 'micro',
          hero: {
            type: "image",
            url: item.thumbnailSrc,
            size: "full",
            aspectRatio: '130:100',
            backgroundColor: '#000000'
          },
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                weight: 'bold',
                size: 'sm',
                text: item.title,
                wrap: true,
                maxLines: 3,
                margin: 'sm'
              },
            ]
          },
          footer: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "button",
                action: {
                  type: "uri",
                  label: "前往",
                  uri: item.link
                },
                style: "primary"
              }
            ]
          }
        }
      })
    }
  } as FlexMessage)
}