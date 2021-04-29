
import { FlexBubble, FlexMessage, MessageEvent } from '@line/bot-sdk';
import * as moment from 'moment';

import { getHimawariDougaList } from '../himawari.lib';
import { client } from './index';

export async function handleHimawariDougaList(event: MessageEvent, page = 1) {
  const { items } = await getHimawariDougaList({
    sort: 'today_view_cnt',
    keyword: '',
    cat: '',
    page: 0,
  });

  return client.replyMessage(event.replyToken, {
    type: "flex",
    altText: '向日葵動畫',
    contents: {
      type: 'carousel',
      contents: items.slice((page - 1) * 12, page * 12).map(item => {
        return {
          type: 'bubble',
          size: 'micro',
          hero: {
            type: "image",
            url: item.image.replace('http://', 'https://'),
            size: "full",
            aspectRatio: '188:106',
            backgroundColor: '#000000',
            // animated: true,
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
                style: "link",
                action: {
                  type: "uri",
                  label: "前往",
                  uri: item.link
                },
              }
            ]
          }
        }
      })
    }
  } as FlexMessage)
}