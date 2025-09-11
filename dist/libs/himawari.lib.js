"use strict";
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
    const { item: items, ...channel } = xml.rss.channel;
    return {
        channel,
        items: items?.map(item => {
            const $ = cheerio_1.default.load(item.description);
            return {
                id: item.link.replace(BASE_URL, ''),
                title: item.title,
                link: item.link,
                image: $('img').attr('src'),
                description: (0, he_1.decode)($('.riRssContributor').html()),
                date_publish: (0, moment_1.default)(item.pubDate).toISOString(),
            };
        }) ?? []
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
            switch (index) {
                case 0:
                    const queryParams = new URLSearchParams($(el).find('a').attr('href'));
                    group_id = queryParams.get('group_id');
                    title = $(el)?.text()?.trim() ?? '';
                    break;
                case 1:
                    count = +$(el)?.text();
                    break;
                case 2:
                    source = $(el)?.text()?.trim() ?? '';
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
            index: +pageMatch?.[1] ?? page,
            size: 30,
            pageAmount: +pageMatch?.[2] ?? 0,
            dataAmount: +pageMatch?.[3] ?? 0,
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