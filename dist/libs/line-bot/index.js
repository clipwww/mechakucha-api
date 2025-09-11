"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMessageEvent = exports.client = exports.lineBotMiddleware = exports.config = void 0;
const bot_sdk_1 = require("@line/bot-sdk");
const movie_1 = require("./movie");
const niconico_1 = require("./niconico");
const himawari_1 = require("./himawari");
const anime1_1 = require("./anime1");
const agefans_1 = require("./agefans");
const komica_1 = require("./komica");
exports.config = {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.LINE_CHANNEL_SECRET
};
exports.lineBotMiddleware = (0, bot_sdk_1.middleware)(exports.config);
exports.client = new bot_sdk_1.Client(exports.config);
async function handleMessageEvent(event) {
    const text = event.message.text;
    let page = +text.match(/p=(.*)/)?.[1];
    page = isNaN(page) ? 1 : page;
    const id = text.match(/id=(.*)/)?.[1];
    const videoId = text.match(/videoId=(.*)/)?.[1];
    switch (true) {
        case text.includes('@hey'):
        case text.includes('@heybot'):
            return replyActionList(event);
        case text.includes('@近期上映電影'):
            return (0, movie_1.handleMovieList)(event, page);
        case text.includes('@威秀影城近期上映'):
            return (0, movie_1.handleVieShowComingMovieList)(event, page);
        case text.includes('@Nico排行'):
            return (0, niconico_1.handleNicoRankList)(event, page);
        case text.includes('@向日葵動畫'):
            return (0, himawari_1.handleHimawariDougaList)(event, page);
        case text.includes('@Anime1'):
            switch (true) {
                case !!id:
                    return (0, anime1_1.handleAnime1BangumiEpisode)(event, id);
                case !!videoId:
                    return (0, anime1_1.handleAnime1Video)(event, videoId);
                default:
                    return (0, anime1_1.handleAnime1List)(event, page);
            }
        case text.includes('@Agefans'):
            return (0, agefans_1.handleAgefansList)(event, page);
        // switch (true) {
        //   case !!id:
        //     return handleAgefansEpisode(event, id)
        //   case !!videoId:
        //     return handleAgefansVideo(event, videoId);
        //   default:
        //     return handleAgefansList(event, page);
        // }
        case text.includes('@新番實況'):
            return (0, komica_1.handleKomicaList)(event, 'live', page);
        case text.includes('@新番捏他'):
            return (0, komica_1.handleKomicaList)(event, 'new', page);
        default:
            break;
        // return client.replyMessage(event.replyToken, {
        //   type: "text",
        //   text,
        // })
    }
}
exports.handleMessageEvent = handleMessageEvent;
function replyActionList(event) {
    return exports.client.replyMessage(event.replyToken, {
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
        }
    });
}
//# sourceMappingURL=index.js.map