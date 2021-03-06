
import { FlexBubble, FlexMessage, MessageEvent } from '@line/bot-sdk';

import { getMovieListGroupByDate } from '../movie.lib';
import { client } from './index';

export async function handleMovieList(event: MessageEvent, page = 1) {
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
          size: "full",
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
      contents: movies.slice((page - 1) * 12, page * 12)
    }
  } as FlexMessage)
}