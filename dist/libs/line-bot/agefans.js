"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAgefansVideo = exports.handleAgefansEpisode = exports.handleAgefansList = void 0;
const agefans_lib_1 = require("../agefans.lib");
const index_1 = require("./index");
async function handleAgefansList(event, page = 1) {
    const items = await (0, agefans_lib_1.getAnimeUpdate)();
    return index_1.client.replyMessage(event.replyToken, {
        type: "flex",
        altText: 'Agefans',
        contents: {
            type: 'carousel',
            contents: items.slice((page - 1) * 12, page * 12).map(item => {
                return {
                    type: 'bubble',
                    size: 'micro',
                    header: {
                        type: 'box',
                        layout: 'vertical',
                        paddingTop: 'sm',
                        paddingBottom: 'sm',
                        contents: [
                            {
                                type: 'text',
                                size: 'sm',
                                text: item.description,
                            },
                        ]
                    },
                    hero: {
                        type: "image",
                        url: item.imgUrl.includes('http') ? item.imgUrl.replace('http', 'https') : `https:${item.imgUrl}`,
                        size: "full",
                        aspectRatio: '150:100',
                        aspectMode: 'cover',
                        backgroundColor: '#000000'
                    },
                    body: {
                        type: 'box',
                        layout: 'vertical',
                        contents: [
                            {
                                type: 'text',
                                weight: 'bold',
                                size: 'sm',
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
                                    // type: "message",
                                    // label: "查看",
                                    // text: `@Agefans?id=${item.id}`
                                    type: 'uri',
                                    label: '前往',
                                    uri: item.link
                                },
                            }
                        ]
                    }
                };
            })
        }
    });
}
exports.handleAgefansList = handleAgefansList;
async function handleAgefansEpisode(event, id) {
    const { title, episodeList } = await (0, agefans_lib_1.getAnimeDetails)(id);
    return index_1.client.replyMessage(event.replyToken, {
        type: "flex",
        altText: 'Anime1',
        contents: {
            "type": "bubble",
            "size": "giga",
            header: {
                type: 'box',
                layout: 'vertical',
                contents: [
                    {
                        type: 'text',
                        weight: 'bold',
                        text: title,
                    }
                ]
            },
            "body": {
                "type": "box",
                "layout": "vertical",
                "paddingAll": "none",
                alignItems: "flex-start",
                "contents": episodeList.map(item => {
                    return {
                        "type": "button",
                        height: "sm",
                        "action": {
                            "type": "message",
                            "label": item.title,
                            "text": `@Agefans?videoId=${item.id},${item.pId},${item.eId}`
                        }
                    };
                })
            },
        }
    });
}
exports.handleAgefansEpisode = handleAgefansEpisode;
async function handleAgefansVideo(event, videoId) {
    const [id, pId, eId] = videoId.split(',');
    const url = await (0, agefans_lib_1.getAnimeVideo)(id, pId, eId);
    console.log(url);
    return index_1.client.replyMessage(event.replyToken, [
        {
            type: "video",
            originalContentUrl: url,
            previewImageUrl: 'https://sta.anicdn.com/playerImg/9.jpg',
            trackingId: id
        }
    ]);
}
exports.handleAgefansVideo = handleAgefansVideo;
//# sourceMappingURL=agefans.js.map