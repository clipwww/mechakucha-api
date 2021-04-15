import * as line from '@line/bot-sdk';
import { ReplyableEvent, MessageEvent, TextEventMessage, FlexMessage, FlexCarousel, FlexBubble } from '@line/bot-sdk';
import * as moment from 'moment';

import { getMovieListGroupByDate } from './movie.lib';
import { getRankingList } from './niconico.lib';
import { getHimawariDougaList } from './himawari.lib';


export const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
}

export const lineBotMiddleware = line.middleware(config);


export const client = new line.Client(config);

export async function handleMessageEvent(event: MessageEvent) {
  const text = (event.message as TextEventMessage).text;

  switch (true) {
    case text === '@近期上映電影': {
      const items = await getMovieListGroupByDate();
      const movies: FlexBubble[] = [];

      items.forEach(item => {
        item.movies.forEach(movie => {
          movies.push({
            type: 'bubble',
            size: 'micro',
            hero: {
              type: "image",
              url: movie.poster.replace('http', 'https'),
              size: "full"
            },
            body: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  weight: 'bold',
                  size: 'md',
                  text: movie.name
                },
                {
                  type: 'text',
                  size: 'sm',
                  text: item.releaseDate
                },
              ]
            }
          })
        })
      })

      return client.replyMessage(event.replyToken, {
        type: "flex",
        altText: '近期上映電影',
        contents: {
          type: 'carousel',
          contents: movies.slice(0, 12)
        }
      } as FlexMessage)
    }

    case text === '@Nico排行': {
      const items = await getRankingList();

      return client.replyMessage(event.replyToken, {
        type: "flex",
        altText: 'Nico排行',
        contents: {
          type: 'carousel',
          contents: items.slice(0, 12).map(item => {
            return {
              type: 'bubble',
              size: 'micro',
              hero: {
                type: "image",
                url: item.thumbnailSrc,
                size: "full",
                aspectRatio: '130:100'
              },
              body: {
                type: 'box',
                layout: 'vertical',
                contents: [
                  {
                    type: 'text',
                    size: 'xxs',
                    text: item.timeLength
                  },
                  {
                    type: 'text',
                    weight: 'bold',
                    size: 'sm',
                    text: item.title,
                    wrap: true,
                    maxLines: 3,
                    margin: 'sm'
                  },
                  {
                    type: 'text',
                    size: 'xxs',
                    text: item.description,
                    margin: 'sm'
                  },
                  {
                    type: 'text',
                    size: 'xxs',
                    text: moment(item.pubDate).format('YYYY/MM/DD HH:mm'),
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

    case text === '@向日葵動畫': {
      const { items } = await getHimawariDougaList({
        sort: 'today_view_cnt',
        keyword: '',
        cat: '',
        page: 0,
      });

      return client.replyMessage(event.replyToken, {
        type: "flex",
        altText: 'Nico排行',
        contents: {
          type: 'carousel',
          contents: items.slice(0, 12).map(item => {
            return {
              type: 'bubble',
              size: 'micro',
              hero: {
                type: "image",
                url: item.image,
                size: "full",
                aspectRatio: '188:106'
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
                  {
                    type: 'text',
                    size: 'xxs',
                    text: moment(item.date_publish).format('YYYY/MM/DD HH:mm'),
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

    default:
      return client.replyMessage(event.replyToken, {
        type: "text",
        text,
      })

  }


}