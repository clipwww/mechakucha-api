"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleHimawariDougaList = void 0;
const moment_1 = __importDefault(require("moment"));
const himawari_lib_1 = require("../himawari.lib");
const index_1 = require("./index");
async function handleHimawariDougaList(event, page = 1) {
    const { items } = await (0, himawari_lib_1.getHimawariDougaList)({
        sort: 'today_view_cnt',
        keyword: '',
        cat: '',
        page: 0,
    });
    return index_1.client.replyMessage(event.replyToken, {
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
                                text: (0, moment_1.default)(item.date_publish).format('YYYY/MM/DD HH:mm'),
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
    });
}
exports.handleHimawariDougaList = handleHimawariDougaList;
//# sourceMappingURL=himawari.js.map