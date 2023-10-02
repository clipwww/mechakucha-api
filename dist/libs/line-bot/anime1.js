"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAnime1Video = exports.handleAnime1BangumiEpisode = exports.handleAnime1List = void 0;
const anime1_lib_1 = require("../anime1.lib");
const index_1 = require("./index");
async function handleAnime1List(event, page = 1) {
    const items = await (0, anime1_lib_1.getBangumiList)();
    return index_1.client.replyMessage(event.replyToken, {
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
                };
            })
        }
    });
}
exports.handleAnime1List = handleAnime1List;
async function handleAnime1BangumiEpisode(event, id) {
    const { title, items } = await (0, anime1_lib_1.getBangumiEpisode)(id);
    return index_1.client.replyMessage(event.replyToken, {
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
                };
            })
        }
    });
}
exports.handleAnime1BangumiEpisode = handleAnime1BangumiEpisode;
async function handleAnime1Video(event, id) {
    const { url } = await (0, anime1_lib_1.getBangumiPlayerById)(id);
    return index_1.client.replyMessage(event.replyToken, [
        {
            type: "video",
            originalContentUrl: url,
            previewImageUrl: 'https://sta.anicdn.com/playerImg/9.jpg',
            trackingId: id
        }
    ]);
}
exports.handleAnime1Video = handleAnime1Video;
//# sourceMappingURL=anime1.js.map