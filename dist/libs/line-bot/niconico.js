"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleNicoRankList = exports.getRankingMessage = void 0;
const niconico_lib_1 = require("../niconico.lib");
const index_1 = require("./index");
async function getRankingMessage(page = 1) {
    const items = await (0, niconico_lib_1.getRankingList)();
    return {
        type: "flex",
        altText: 'Nico排行',
        contents: {
            type: 'carousel',
            contents: items.slice((page - 1) * 12, page * 12).map(item => {
                return {
                    type: 'bubble',
                    size: 'micro',
                    hero: {
                        type: "image",
                        url: item.thumbnailSrc,
                        size: "full",
                        aspectRatio: '130:100',
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
                                text: item.title,
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
                                    type: "uri",
                                    label: "前往",
                                    uri: item.link
                                },
                            }
                        ]
                    }
                };
            })
        }
    };
}
exports.getRankingMessage = getRankingMessage;
async function handleNicoRankList(event, page = 1) {
    const message = await getRankingMessage(page);
    return index_1.client.replyMessage(event.replyToken, message);
}
exports.handleNicoRankList = handleNicoRankList;
//# sourceMappingURL=niconico.js.map