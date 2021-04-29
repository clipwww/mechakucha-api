import * as line from '@line/bot-sdk';
import { ReplyableEvent, MessageEvent, TextEventMessage, FlexMessage, FlexCarousel, FlexBubble } from '@line/bot-sdk';
import * as moment from 'moment';

import { handleMovieList } from './movie';
import { handleNicoRankList } from './niconico';
import { handleHimawariDougaList } from './himawari';
import { handleAnime1List } from './anime1';
import { handleAgefansList } from './agefans';


export const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
}

export const lineBotMiddleware = line.middleware(config);


export const client = new line.Client(config);

export async function handleMessageEvent(event: MessageEvent) {
  const text = (event.message as TextEventMessage).text;
  let page = +text.match(/p=(.*)/i)?.[1];
  page = isNaN(page) ? 1 : page;

  switch (true) {
    case text.includes('@hey'):
      return replyActionList(event);
    case text.includes('@近期上映電影'):
      return handleMovieList(event, page);
    case text.includes('@Nico排行'):
      return handleNicoRankList(event, page);
    case text.includes('@向日葵動畫'):
      return handleHimawariDougaList(event, page);
    case text.includes('@Anime1'):
      return handleAnime1List(event, page);
    case text.includes('@Agefans'):
      return handleAgefansList(event, page);
    default:
      break;
    // return client.replyMessage(event.replyToken, {
    //   type: "text",
    //   text,
    // })

  }
}

function replyActionList(event: MessageEvent) {
  return client.replyMessage(event.replyToken, {
    type: "flex",
    altText: '嗯哼？',
    contents: {
      "type": "bubble",
      "size": "kilo",
      "header": {
        "type": "box",
        "layout": "vertical",
        "contents": [
          {
            "type": "text",
            "text": "嗯哼？",
            "size": "md",
            "margin": "none",
            "align": "start"
          }
        ],
        "paddingAll": "md"
      },
      "hero": {
        "type": "image",
        "url": "https://clipwww.github.io/liff-sp/images/howhow.jpg",
        "size": "full",
        "aspectRatio": "20:10",
        "backgroundColor": "#000000",
        "margin": "none",
        "position": "relative",
        "offsetTop": "none",
        "aspectMode": "cover"
      },
      "body": {
        "type": "box",
        "layout": "vertical",
        "paddingAll": "none",
        "contents": [
          {
            "type": "button",
            "action": {
              "type": "message",
              "label": "Anime1",
              "text": "@Anime1"
            }
          },
          {
            "type": "button",
            "action": {
              "type": "message",
              "label": "Agefans",
              "text": "@Agefans"
            }
          },
          {
            "type": "button",
            "action": {
              "type": "message",
              "label": "Nico排行",
              "text": "@Nico排行"
            },
            "margin": "none",
            "offsetTop": "none"
          },
          {
            "type": "button",
            "action": {
              "type": "message",
              "label": "向日葵動畫",
              "text": "@向日葵動畫"
            }
          },
          // {
          //   "type": "button",
          //   "action": {
          //     "type": "message",
          //     "label": "近期上映電影",
          //     "text": "@近期上映電影"
          //   }
          // }
        ]
      },

    } as FlexBubble
  })
}