import * as line from '@line/bot-sdk';
import { MessageEvent, TextEventMessage, FlexBubble } from '@line/bot-sdk';

import { handleMovieList } from './movie';
import { handleNicoRankList } from './niconico';
import { handleHimawariDougaList } from './himawari';
import { handleAnime1List, handleAnime1BangumiEpisode, handleAnime1Video } from './anime1';
import { handleAgefansList, handleAgefansEpisode, handleAgefansVideo } from './agefans';
import { handleKomicaList } from './komica';


export const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
}

export const lineBotMiddleware = line.middleware(config);


export const client = new line.Client(config);

export async function handleMessageEvent(event: MessageEvent) {
  const text = (event.message as TextEventMessage).text;
  let page = +text.match(/p=(.*)/)?.[1];
  page = isNaN(page) ? 1 : page;
  const id = text.match(/id=(.*)/)?.[1];
  const videoId = text.match(/videoId=(.*)/)?.[1];

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
      switch (true) {
        case !!id:
          return handleAnime1BangumiEpisode(event, id)
        case !!videoId:
          return handleAnime1Video(event, videoId);
        default:
          return handleAnime1List(event, page);
      }
    case text.includes('@Agefans'):
      return handleAgefansList(event, page);
      // switch (true) {
      //   case !!id:
      //     return handleAgefansEpisode(event, id)
      //   case !!videoId:
      //     return handleAgefansVideo(event, videoId);
      //   default:
      //     return handleAgefansList(event, page);
      // }
    case text.includes('@新番實況'):
      return handleKomicaList(event, 'live', page);
    case text.includes('@新番捏他'):
      return handleKomicaList(event, 'new', page);
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
          {
            "type": "button",
            "action": {
              "type": "message",
              "label": "新番實況",
              "text": "@新番實況"
            }
          },
          {
            "type": "button",
            "action": {
              "type": "message",
              "label": "新番捏他",
              "text": "@新番捏他"
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