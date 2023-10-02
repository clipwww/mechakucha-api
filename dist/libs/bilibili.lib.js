"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBiliBiliDanmaku = void 0;
const cheerio_1 = __importDefault(require("cheerio"));
const moment_1 = __importDefault(require("moment"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const parseRgb256IntegerColor = (color) => {
    const rgb = parseInt(color, 10);
    const r = (rgb >>> 4) & 0xff;
    const g = (rgb >>> 2) & 0xff;
    const b = (rgb >>> 0) & 0xff;
    return `rgb(${r},${g},${b})`;
};
const getBiliBiliDanmaku = async (id) => {
    const response = await (0, node_fetch_1.default)(`https://api.bilibili.com/x/v1/dm/list.so?oid=${id}`);
    const xmlString = await response.text();
    const $ = cheerio_1.default.load(xmlString, {
        xmlMode: true,
    });
    return $('d').map((i, el) => {
        const $d = $(el);
        const p = $d.attr('p');
        const [time, mode, size, color, create, bottom, sender, id] = p.split(',');
        return {
            id,
            sender,
            text: $d.text(),
            msg: $d.text(),
            time: +time,
            digital_time: moment_1.default.utc(+time * 1000).format('HH:mm:ss'),
            // We do not support ltr mode
            mode: [null, 'rtl', 'rtl', 'rtl', 'bottom', 'top'][+mode],
            size: +size,
            color: parseRgb256IntegerColor(color),
            bottom: +bottom > 0,
            date: create,
            date_iso_string: new Date(+create * 1000).toISOString(),
        };
    }).get().sort((a, b) => a.time > b.time ? 1 : -1);
};
exports.getBiliBiliDanmaku = getBiliBiliDanmaku;
//# sourceMappingURL=bilibili.lib.js.map