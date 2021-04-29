
import { FlexBubble, FlexMessage, MessageEvent } from '@line/bot-sdk';

import { getBangumiList } from '../anime1.lib';
import { client } from './index';

export async function handleAnime1List(event: MessageEvent, page = 1) {
  const items = await getBangumiList();

  return client.replyMessage(event.replyToken, {
    type: "flex",
    altText: 'Anime1',
    contents: {
      "type": "bubble",
      "size": "giga",
      "body": {
        "type": "box",
        "layout": "vertical",
        "paddingAll": "none",
        alignItems: "flex-start",
        "contents": items.slice((page - 1 * 10), page * 10).map(item => {
          return {
            "type": "button",
            height: "sm",
            "action": {
              "type": "uri",
              "label": item.name,
              "uri": `https://anime1.me/?cat=${item.id}`
            }
          }
        })
      },
    }
  } as FlexMessage)
}