
import type { FlexMessage, MessageEvent, VideoMessage } from '@line/bot-sdk';

import { getBangumiEpisode, getBangumiList, getBangumiPlayerById } from '../anime1.lib';
import { client } from './index';

export async function handleAnime1List(event: MessageEvent, page = 1) {
  const items = await getBangumiList();

  return client.replyMessage(event.replyToken, {
    type: "flex",
    altText: 'Anime1',
    contents: {
      type: 'carousel',
      contents: items.slice((page - 1) * 12, page * 12).map(item => {
        return {
          type: 'bubble',
          size: 'micro',
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                weight: 'bold',
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
                style: "link",
                action: {
                  "type": "message",
                  "label": '查看',
                  "text": `@Anime1?id=${item.id}`
                }
              }
            ]
          }
        }
      })

    }
  } as FlexMessage)
}

export async function handleAnime1BangumiEpisode(event: MessageEvent, id: string) {
  const { title, items } = await getBangumiEpisode(id);

  return client.replyMessage(event.replyToken, {
    type: "flex",
    altText: 'Anime1',
    contents: {
      type: 'carousel',
      contents: items.slice(0, 12).map(item => {
        return {
          type: 'bubble',
          size: 'micro',
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                weight: 'bold',
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
                style: "link",
                action: {
                  "type": "message",
                  "label": '查看',
                  "text": `@Anime1?videoId=${item.id}`
                }
              }
            ]
          }
        }
      })
    }
  } as FlexMessage)
}

export async function handleAnime1Video(event: MessageEvent, id: string) {
  const { url } = await getBangumiPlayerById(id);

  return client.replyMessage(event.replyToken, [
    {
      type: "video",
      originalContentUrl: url,
      previewImageUrl: 'https://sta.anicdn.com/playerImg/9.jpg',
      trackingId: id
    } as VideoMessage
  ])
}