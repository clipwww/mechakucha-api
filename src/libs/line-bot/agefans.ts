
import { FlexBubble, FlexMessage, MessageEvent } from '@line/bot-sdk';

import { getAnimeUpdate } from '../agefans.lib';
import { client } from './index';

export async function handleAgefansList(event: MessageEvent, page = 1) {
  const items = await getAnimeUpdate();

  return client.replyMessage(event.replyToken, {
    type: "flex",
    altText: 'Agefans',
    contents: {
      type: 'carousel',
      contents: items.slice((page - 1) * 12, page * 12).map(item => {
        return {
          type: 'bubble',
          size: 'micro',
          header: {
            type: 'box',
            layout: 'vertical',
            paddingTop: 'sm',
            paddingBottom: 'sm',
            contents: [
              {
                type: 'text',
                size: 'sm',
                text: item.description,
              },
            ]
          },
          hero: {
            type: "image",
            url: item.imgUrl,
            size: "full",
            aspectRatio: '150:100',
            aspectMode: 'cover',
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
                text: item.name,
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