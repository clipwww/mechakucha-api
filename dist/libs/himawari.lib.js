"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHimawariDougaDanmaku = exports.getHimawariDanmakuList = exports.getHimawariDougaDetails = exports.getHimawariDougaList = void 0;
const cheerio_1 = __importDefault(require("cheerio"));
const moment_1 = __importDefault(require("moment"));
const xml2json_1 = require("xml2json");
const he_1 = require("he");
const utilities_1 = require("../utilities");
const BASE_URL = 'http://himado.in/';
const getHimawariDougaList = async ({ sort = 'today_view_cnt', keyword = '', cat, page }) => {
    var _a;
    const { data: xmlString } = await utilities_1.axiosInstance.get(BASE_URL, {
        params: {
            sort,
            keyword,
            cat,
            page: page > 1 ? page : null,
            rss: 1,
        }
    });
    const xml = JSON.parse((0, xml2json_1.toJson)(xmlString));
    const _b = xml.rss.channel, { item: items } = _b, channel = __rest(_b, ["item"]);
    return {
        channel,
        items: (_a = items === null || items === void 0 ? void 0 : items.map(item => {
            const $ = cheerio_1.default.load(item.description);
            return {
                id: item.link.replace(BASE_URL, ''),
                title: item.title,
                link: item.link,
                image: $('img').attr('src'),
                description: (0, he_1.decode)($('.riRssContributor').html()),
                date_publish: (0, moment_1.default)(item.pubDate).toISOString(),
            };
        })) !== null && _a !== void 0 ? _a : []
    };
};
exports.getHimawariDougaList = getHimawariDougaList;
const getHimawariDougaDetails = async (id) => {
    const { data: htmlString } = await utilities_1.axiosInstance.get(BASE_URL, {
        params: {
            id,
            mode: 'movie',
        }
    });
    const $xml = cheerio_1.default.load(htmlString, {
        xmlMode: true,
    });
    const xml = JSON.parse((0, xml2json_1.toJson)($xml.xml()));
    return xml.movie;
};
exports.getHimawariDougaDetails = getHimawariDougaDetails;
const getHimawariDanmakuList = async (keyword, page = 1, sort = 'comment_cnt', sortby = 'desc') => {
    var _a, _b, _c;
    const { data: htmlString } = await utilities_1.axiosInstance.get(BASE_URL, {
        params: {
            keyword,
            page: page - 1,
            mode: 'commentgroup',
            cat: 'search',
            sort,
            sortby
        }
    });
    const $ = cheerio_1.default.load(htmlString);
    const items = $('#thumb tr').map((i, tr) => {
        const $tds = $(tr).find('td');
        let group_id = '';
        let title = '';
        let count = 0;
        let source = '';
        $tds.each((index, el) => {
            var _a, _b, _c, _d, _e, _f, _g;
            switch (index) {
                case 0:
                    const queryParams = new URLSearchParams($(el).find('a').attr('href'));
                    group_id = queryParams.get('group_id');
                    title = (_c = (_b = (_a = $(el)) === null || _a === void 0 ? void 0 : _a.text()) === null || _b === void 0 ? void 0 : _b.trim()) !== null && _c !== void 0 ? _c : '';
                    break;
                case 1:
                    count = +((_d = $(el)) === null || _d === void 0 ? void 0 : _d.text());
                    break;
                case 2:
                    source = (_g = (_f = (_e = $(el)) === null || _e === void 0 ? void 0 : _e.text()) === null || _f === void 0 ? void 0 : _f.trim()) !== null && _g !== void 0 ? _g : '';
                    break;
            }
        });
        return {
            group_id,
            title,
            count,
            source,
        };
    }).get();
    const pagenav = $('.pagenavi_res').first().text();
    const pageMatch = pagenav.match(/page (.*) of (.*) result:(.*)/);
    return {
        items,
        pageInfo: {
            index: (_a = +(pageMatch === null || pageMatch === void 0 ? void 0 : pageMatch[1])) !== null && _a !== void 0 ? _a : page,
            size: 30,
            pageAmount: (_b = +(pageMatch === null || pageMatch === void 0 ? void 0 : pageMatch[2])) !== null && _b !== void 0 ? _b : 0,
            dataAmount: (_c = +(pageMatch === null || pageMatch === void 0 ? void 0 : pageMatch[3])) !== null && _c !== void 0 ? _c : 0,
        },
    };
};
exports.getHimawariDanmakuList = getHimawariDanmakuList;
const getHimawariDougaDanmaku = async (id, isGroupId = false) => {
    const url = isGroupId ? `${BASE_URL}?mode=commentgroup&group_id=${id}` : `${BASE_URL}${id}`;
    const { data: htmlString } = await utilities_1.axiosInstance.get(url);
    const $ = cheerio_1.default.load(htmlString);
    const group_id = $('input[name="group_id"]').val();
    const key = $('input[name="key"]').val();
    const { data: xmlString } = await utilities_1.axiosInstance.get(`${BASE_URL}api/player`, {
        params: {
            mode: 'comment',
            id,
            group_id,
            key,
            start: 0,
            limit: 100000,
            ver: "20100220"
        }
    });
    const $xml = $(xmlString);
    const baseDate = parseInt($xml.find('base').attr("d"), 36);
    const ids = [];
    $xml.find("d").each((i, e) => {
        const index = parseInt($(e).attr("n"), 36);
        const id = $(e).attr("u");
        ids[index] = id;
    });
    return $xml.find("c").map((i, e) => {
        const deleted = $(e).attr("deleted");
        const arr = $(e).attr("p").split(",");
        const date = baseDate - parseInt(arr[1], 36);
        const vpos_master = parseInt(arr[0], 36);
        return {
            id: ids[parseInt(arr[3], 36)],
            no: parseInt(arr[2], 36).toString(),
            mail: arr[6],
            vpos: Math.floor(parseInt(arr[0], 36) / 100 * 30),
            vpos_master,
            time: vpos_master / 100,
            date,
            msg: $(e).text(),
            text: $(e).text(),
            digital_time: moment_1.default.utc(vpos_master * 10).format('HH:mm:ss'),
            date_iso_string: new Date(date * 1000).toISOString(),
            deleted,
        };
    }).get().filter(item => !['1', '2'].includes(item.deleted)).sort((a, b) => a.vpos_master > b.vpos_master ? 1 : -1);
};
exports.getHimawariDougaDanmaku = getHimawariDougaDanmaku;
//# sourceMappingURL=himawari.lib.js.map