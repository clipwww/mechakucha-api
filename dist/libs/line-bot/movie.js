"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVieShowComingMovieListMessage = exports.handleVieShowComingMovieList = exports.getRecentMovieMessage = exports.handleMovieList = void 0;
const utilities_1 = require("../../utilities");
const movie_lib_1 = require("../movie.lib");
const index_1 = require("./index");
async function handleMovieList(event, page = 1) {
    const message = await getRecentMovieMessage(page);
    return index_1.client.replyMessage(event.replyToken, message);
}
exports.handleMovieList = handleMovieList;
async function getRecentMovieMessage(page = 1) {
    const items = await (0, movie_lib_1.getMovieListGroupByDate)();
    const movies = [];
    items.forEach(item => {
        item.movies.forEach(movie => {
            movies.push({
                type: 'bubble',
                size: 'micro',
                hero: {
                    type: "image",
                    url: movie.poster.replace('http', 'https'),
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
exports.getRecentMovieMessage = getRecentMovieMessage;
async function handleVieShowComingMovieList(event, page = 1) {
    const message = await getVieShowComingMovieListMessage(page);
    return index_1.client.replyMessage(event.replyToken, message);
}
exports.handleVieShowComingMovieList = handleVieShowComingMovieList;
async function getVieShowComingMovieListMessage(page = 1) {
    const key = `movie-vieshow-coming`;
    const cacheValue = utilities_1.lruCache.get(key);
    const movieList = cacheValue ? cacheValue : await (0, movie_lib_1.getVieShowComingMovieList)(page);
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
exports.getVieShowComingMovieListMessage = getVieShowComingMovieListMessage;
//# sourceMappingURL=movie.js.map