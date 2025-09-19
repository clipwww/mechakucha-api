import { lruCache } from '../../utilities';
import { getMovieListGroupByDate, getVieShowComingMovieList } from '../movie.lib';
import { client } from './index';
export async function handleMovieList(event, page = 1) {
    const message = await getRecentMovieMessage(page);
    return client.replyMessage(event.replyToken, message);
}
export async function getRecentMovieMessage(page = 1) {
    const items = await getMovieListGroupByDate();
    const movies = [];
    items.forEach(item => {
        item.movies.forEach(movie => {
            movies.push({
                type: 'bubble',
                size: 'micro',
                hero: {
                    type: "image",
                    url: movie.poster ? movie.poster.replace('http', 'https') : 'https://via.placeholder.com/300x400?text=No+Image',
                    size: "full",
                    backgroundColor: '#dddddd'
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
            });
        });
    });
    return {
        type: "flex",
        altText: '近期上映電影',
        contents: {
            type: 'carousel',
            contents: movies.slice((page - 1) * 12, page * 12)
        }
    };
}
export async function handleVieShowComingMovieList(event, page = 1) {
    const message = await getVieShowComingMovieListMessage(page);
    return client.replyMessage(event.replyToken, message);
}
export async function getVieShowComingMovieListMessage(page = 1) {
    const key = `movie-vieshow-coming`;
    const cacheValue = lruCache.get(key);
    const movieList = cacheValue ? cacheValue : await getVieShowComingMovieList(page);
    return {
        type: "flex",
        altText: '威秀影城近期上映電影',
        contents: {
            type: 'carousel',
            contents: movieList.slice(0, 12).map(movie => {
                return {
                    "type": "bubble",
                    "size": "kilo",
                    "hero": {
                        "type": "image",
                        "url": movie.imgSrc,
                        "size": "full",
                        "backgroundColor": "#dddddd"
                    },
                    "body": {
                        "type": "box",
                        "layout": "vertical",
                        "contents": [
                            {
                                "type": "box",
                                "layout": "horizontal",
                                "contents": [
                                    {
                                        "type": "text",
                                        "size": "xs",
                                        "text": movie.time,
                                        "offsetTop": "none",
                                        "offsetBottom": "none",
                                        "offsetStart": "none",
                                        "offsetEnd": "none",
                                        "align": "start"
                                    },
                                    {
                                        "type": "text",
                                        "text": movie.theaterMarks.join(', '),
                                        "size": "xxs",
                                        "align": "end",
                                        "margin": "sm"
                                    }
                                ],
                                "position": "relative",
                                "spacing": "none",
                                "justifyContent": "space-between"
                            },
                            {
                                "type": "text",
                                "weight": "bold",
                                "size": "lg",
                                "text": movie.title,
                                "margin": "md"
                            },
                            {
                                "type": "text",
                                "text": movie.titleEN,
                                "size": "xxs",
                                "color": "#888888",
                                "margin": "xs"
                            }
                        ],
                        "paddingAll": "xl",
                        "paddingBottom": "none",
                        "paddingTop": "md"
                    },
                    "footer": {
                        "type": "box",
                        "layout": "vertical",
                        "contents": [
                            {
                                "type": "button",
                                "action": {
                                    "type": "uri",
                                    "label": "介紹頁面",
                                    "uri": movie.url
                                },
                                "style": "primary"
                            }
                        ]
                    }
                };
            })
        }
    };
}
