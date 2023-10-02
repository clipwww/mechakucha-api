"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRankingList = exports.getNicoNicoDanmaku = void 0;
const moment_1 = __importDefault(require("moment"));
const xml2json_1 = require("xml2json");
const node_fetch_1 = __importDefault(require("node-fetch"));
const cheerio_1 = __importDefault(require("cheerio"));
const he_1 = require("he");
const utilities_1 = require("../utilities");
const BASE_URL = `https://www.nicovideo.jp/watch`;
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
const parseNiconicoColor = (mail) => {
    const colorTable = {
        red: { r: 255, g: 0, b: 0 },
        pink: { r: 255, g: 128, b: 128 },
        orange: { r: 255, g: 184, b: 0 },
        yellow: { r: 255, g: 255, b: 0 },
        green: { r: 0, g: 255, b: 0 },
        cyan: { r: 0, g: 255, b: 255 },
        blue: { r: 0, g: 0, b: 255 },
        purple: { r: 184, g: 0, b: 255 },
        black: { r: 0, g: 0, b: 0 },
    };
    const defaultColor = { r: 255, g: 255, b: 255 };
    const line = mail.toLowerCase().split(/\s+/);
    const color = Object.keys(colorTable).find(color => line.includes(color));
    const retColor = color ? colorTable[color] : defaultColor;
    return rgbToHex(retColor.r, retColor.g, retColor.b);
};
const parseNiconicoMode = (mail) => {
    const line = mail.toLowerCase().split(/\s+/);
    if (line.includes('ue'))
        return 'top';
    if (line.includes('shita'))
        return 'bottom';
    return 'rtl';
};
const parseNiconicoSize = (mail) => {
    const line = mail.toLowerCase().split(/\s+/);
    if (line.includes('big'))
        return 36;
    if (line.includes('small'))
        return 16;
    return 25;
};
const danmakuFilter = danmaku => {
    if (!danmaku)
        return false;
    if (!danmaku.text)
        return false;
    if (!danmaku.mode)
        return false;
    if (!danmaku.size)
        return false;
    if (danmaku.time < 0 || danmaku.time >= 360000)
        return false;
    return true;
};
const niconicoParser = (resultArray) => {
    const chatList = resultArray.map(item => item.chat).filter(x => x);
    return chatList.map(comment => {
        if (!comment.content || !(comment.vpos >= 0) || !comment.no)
            return null;
        const { vpos, mail = '', content, no, user_id, date } = comment;
        return {
            text: content,
            time: vpos / 100,
            digital_time: moment_1.default.utc(vpos * 10).format('HH:mm:ss'),
            color: parseNiconicoColor(mail),
            mode: parseNiconicoMode(mail),
            size: parseNiconicoSize(mail),
            id: no,
            user_id,
            date,
            date_iso_string: new Date(date * 1000).toISOString(),
        };
    }).filter(danmakuFilter).sort((a, b) => a.time > b.time ? 1 : -1);
};
const getNicoNicoDanmaku = async (id) => {
    return new Promise(async (reslove, reject) => {
        const page = await utilities_1.puppeteerUtil.newPage();
        await page.setCookie({
            name: 'lang',
            value: 'ja-jp',
            path: '/',
            domain: '.nicovideo.jp'
        });
        // page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('response', async (response) => {
            const url = response.url();
            if (!url.includes('://nmsg.nicovideo.jp/api.json')) {
                return;
            }
            // console.log(response.request().postData())
            const ret = await response.json();
            reslove(niconicoParser(ret));
        });
        await page.goto(`${BASE_URL}/${id}`, {
            waitUntil: 'networkidle0',
        });
        setTimeout(() => {
            reject('timeout.');
        }, 1000 * 15);
    });
};
exports.getNicoNicoDanmaku = getNicoNicoDanmaku;
async function getRankingList(type = 'all', term = '24h') {
    const response = await (0, node_fetch_1.default)(`https://www.nicovideo.jp/ranking/genre/${type}?term=${term}&rss=2.0&lang=ja-jp`);
    const xmlString = await response.text();
    const { rss } = JSON.parse((0, xml2json_1.toJson)(xmlString));
    rss.channel.pubDate = (0, moment_1.default)(rss.channel.pubDate);
    rss.channel.lastBuildDate = (0, moment_1.default)(rss.channel.lastBuildDate);
    return rss.channel.item.map(item => {
        const $ = cheerio_1.default.load(`<div>${item.description}</div>`);
        const url = new URL(item.link);
        return Object.assign(Object.assign({}, item), { id: url.pathname.replace('/watch/', ''), pubDate: (0, moment_1.default)(item.pubDate).toISOString(), description: (0, he_1.decode)($('.nico-description').html()) || '', originDescription: item.description, memo: $('.nico-memo').text() || '', timeLength: $('.nico-info-length').text() || '', nicoInfoDate: $('.nico-info-date').text() || '', totalView: +$('.nico-info-total-view').text().replace(/,/g, ''), commentCount: +$('.nico-info-total-res').text().replace(/,/g, ''), mylistCount: +$('.nico-info-total-mylist').text().replace(/,/g, ''), thumbnailSrc: $('.nico-thumbnail img').attr('src') || '' });
    });
}
exports.getRankingList = getRankingList;
;
//# sourceMappingURL=niconico.lib.js.map