"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryAnimeList = exports.getAnimeVideo = exports.getAnimeDetails = exports.getAnimeUpdate = exports.getAnimeList = void 0;
// import fetch from 'node-fetch';
const cheerio_1 = __importDefault(require("cheerio"));
const chinese_conv_1 = require("chinese-conv");
const he_1 = require("he");
const utilities_1 = require("../utilities");
function tify(value = '') {
    return (0, chinese_conv_1.tify)(value || '');
}
const BASE_URL = 'https://www.agemys.org';
const getAnimeList = async () => {
    const { data: htmlString } = await utilities_1.axiosInstance.get(BASE_URL);
    const $ = cheerio_1.default.load(htmlString);
    let animeList = [];
    $('.tab-pane').each((i, pel) => {
        const $pel = $(pel);
        const id = $pel.attr('id');
        const tempList = $pel.find('li').map((i, el) => {
            const $el = $(el);
            const $link = $el.find('a');
            const href = $link.attr('href');
            const isnew = !!$el.find('.title_new').text();
            return {
                id: +href.match(/\d+/g)[0],
                name: tify($link.text()),
                wd: parseInt(id) || 7,
                isnew,
                mttime: undefined,
                namefornew: tify($el.find('.title_sub').text())
            };
        }).get();
        animeList = animeList.concat(tempList);
    });
    return animeList;
};
exports.getAnimeList = getAnimeList;
const getAnimeUpdate = async () => {
    // 取得最近更新的列表
    const { data: htmlString } = await utilities_1.axiosInstance.get(`${BASE_URL}/update`);
    const $ = cheerio_1.default.load(htmlString);
    const items = $('.video_item').map((_, li) => {
        const $li = $(li);
        const $link = $li.find('a');
        const href = $link.attr('href');
        return {
            id: +href.match(/\d+/g)[0],
            link: href,
            name: tify($link.text()),
            imgUrl: $li.find('img').attr('src') || '',
            description: tify($li.find('.video_item--info')?.text()?.trim())
        };
    }).get();
    return items;
};
exports.getAnimeUpdate = getAnimeUpdate;
const getAnimeDetails = async (id) => {
    const { data: htmlString } = await utilities_1.axiosInstance.get(`${BASE_URL}/detail/${id}`);
    const $ = cheerio_1.default.load(htmlString);
    const $img = $('img.poster');
    const animeObj = {
        area: '',
        type: '',
        originName: '',
        studio: '',
        dateAired: '',
        status: '',
        tags: [],
        officialWebsite: '',
    };
    $('.detail_imform_kv').each((i, kv) => {
        const tag = $(kv).find('span:nth-child(1)').text();
        const value = $(kv).find('span:nth-child(2)').text();
        switch (tag) {
            case '地区：':
                animeObj.area = tify(value);
                break;
            case '动画种类：':
                animeObj.type = tify(value);
                break;
            case '原版名称：':
                animeObj.originName = value;
                break;
            case '制作公司：':
                animeObj.studio = value;
                break;
            case '首播时间：':
                animeObj.dateAired = value;
                break;
            case '播放状态：':
                animeObj.status = tify(value);
                break;
            case '标签：':
                animeObj.tags = value.split(' ').map(text => tify(text));
                break;
            case '官方网站：':
                animeObj.officialWebsite = value;
                break;
        }
    });
    // https://apd-vliveachy.apdcdn.tc.qq.com/vmtt.tc.qq.com/1098_7d490da8190677a7ac4584160c4f8c09.f0.mp4?vkey=87C66692CC6BD228350E34FA8C334CC490B04E87F33679AA070DBDC20CD758B80364E351A46773CD35770D1A46C8D83B68C33EDE0A72317AE0084BA1F87771E3F61B952C3F85CD13F1924C3E932E1CF005E0F59581B9A0EA
    let episodeList;
    $('.movurl').each((i, movurl) => {
        const $movurl = $(movurl);
        if ($movurl.css('display') !== 'none') {
            episodeList = $movurl.find('li').map((i, li) => {
                const $li = $(li);
                const href = $li.find('a').attr('href');
                const playid = href.match(/(playid=)+([\w-]*)?/)?.[0]?.replace('playid=', '');
                return {
                    id: playid,
                    pId: playid.split('_')[0],
                    eId: playid.split('_')[1],
                    href: `${BASE_URL}${href}`,
                    title: tify($li.text().trim())
                };
            }).get();
        }
    });
    const desc = $('.detail_imform_desc_pre p')?.html() ?? '';
    return {
        id,
        title: tify($img.attr('alt')),
        imgUrl: `https://${$img.attr('src')}`,
        description: tify((0, he_1.decode)(desc)),
        ...animeObj,
        episodeList,
    };
};
exports.getAnimeDetails = getAnimeDetails;
const getAnimeVideo = async (id, pId, eId) => {
    const { status, data, headers } = await utilities_1.axiosInstance.get(`${BASE_URL}/_getplay?aid=${id}&playindex=${pId}&epindex=${eId}&r=${Math.random()}`, {
        headers: {
            referer: `${BASE_URL}/play/${id}?playid=${pId}_${eId}`
        },
        maxRedirects: 0
    });
    return data?.vurl || `${BASE_URL}/play/${id}?playid=${pId}_${eId}`;
};
exports.getAnimeVideo = getAnimeVideo;
const queryAnimeList = async (keyword, page = 1) => {
    const { data: htmlString } = await utilities_1.axiosInstance.get(`${BASE_URL}/search`, {
        params: {
            query: decodeURIComponent(keyword),
            page,
        }
    });
    const $ = cheerio_1.default.load(htmlString);
    const list = $('.blockcontent1 .cell').map((i, cell) => {
        const $cell = $(cell);
        let type, originName, studio, dateAired, status, tags, description;
        $cell.find('.cell_imform_kv').each((i, kv) => {
            const tag = $(kv).find('span:nth-child(1)').text();
            const value = $(kv).find('span:nth-child(2)').text();
            switch (tag) {
                case '动画种类：':
                    type = tify(value);
                    break;
                case '原版名称：':
                    originName = value;
                    break;
                case '制作公司：':
                    studio = value;
                    break;
                case '首播时间：':
                    dateAired = value;
                    break;
                case '播放状态：':
                    status = tify(value);
                    break;
                case '剧情类型：':
                    tags = value.split(' ').map(text => tify(text));
                    break;
                case '简介：':
                    description = tify($(kv).find('.cell_imform_desc').text().trim());
                    break;
            }
        });
        return {
            id: $cell.find('.cell_imform_name').attr('href')?.replace('detail', '')?.replace(/\//g, ''),
            title: tify($cell.find('.cell_imform_name').text()),
            imgUrl: `https://${$cell.find('img').attr('src')}`,
            type,
            originName,
            studio,
            dateAired,
            status,
            tags,
            description
        };
    }).get();
    return list;
};
exports.queryAnimeList = queryAnimeList;
//# sourceMappingURL=agefans.lib.js.map