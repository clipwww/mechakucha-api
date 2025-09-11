"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.m3u8toMP4 = exports.getBangumiPlayerById = exports.getMp4Url = exports.getM3u8Url = exports.getBangumiEpisode = exports.getBangumiList = void 0;
const cheerio_1 = __importDefault(require("cheerio"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const form_data_1 = __importDefault(require("form-data"));
const convert_lib_1 = require("../libs/convert.lib");
const utilities_1 = require("../utilities");
const BASE_URL = 'https://anime1.me/';
const getBangumiList = async () => {
    const response = await (0, node_fetch_1.default)(`https://d1zquzjgwo9yb.cloudfront.net/?_=${+new Date()}`);
    const animeList = await response.json();
    return animeList.map((data, i) => {
        const [id, name, description, year, season, fansub] = data;
        return {
            id: `${id}`,
            name,
            description,
            year,
            season,
            fansub
        };
    });
};
exports.getBangumiList = getBangumiList;
const getBangumiEpisode = async (id) => {
    async function getEpisode(url) {
        try {
            const { data: htmlString } = await utilities_1.axiosInstance.get(url, {
                // @ts-ignore
                credentials: 'include',
                headers: {
                    Cookie: "videopassword=1",
                },
            });
            console.log(htmlString);
            const bangumiItems = [];
            const $ = cheerio_1.default.load(htmlString);
            const title = $('.page-title')?.text() ?? '';
            const bangumis = $('[id*="post-"]');
            for (let i = 0; i < bangumis.length; i++) {
                const $el = $(bangumis[i]);
                let iframeSrc = '';
                let type = '';
                switch (true) {
                    case !!$el.find('iframe').length:
                        iframeSrc = $el.find('iframe')?.attr('src');
                        type = 'mp4';
                        break;
                    case !!$el.find('.loadvideo')?.attr('data-src'):
                        iframeSrc = $el.find('.loadvideo')?.attr('data-src');
                        type = 'm3u8';
                        break;
                    case !!$el.find('.youtubePlayer').attr('data-vid'):
                        iframeSrc = `https://www.youtube-nocookie.com/embed/${$el.find('.youtubePlayer').attr('data-vid')}?rel=0&autoplay=1&modestbranding=1`;
                        type = 'yt';
                    case !!$el.find('video').length:
                        try {
                            const formData = new form_data_1.default();
                            formData.append('d', decodeURIComponent($el.find('video').attr('data-apireq')));
                            const { data } = await utilities_1.axiosInstance.post('https://v.anime1.me/api', formData, {
                                headers: {
                                    ...formData.getHeaders()
                                },
                            });
                            iframeSrc = data.s[0].src;
                            type = 'mp4';
                            console.log(iframeSrc);
                        }
                        catch (error) {
                            iframeSrc = `${error}`;
                        }
                        break;
                }
                bangumiItems.push({
                    id: $el.attr('id')?.replace('post-', '') ?? '',
                    name: $el.find('.entry-title')?.text() ?? '',
                    type,
                    iframeSrc,
                    datePublished: $el.find('.published')?.attr('datetime'),
                });
            }
            if ($('.nav-previous a').length) {
                const prevUrl = $('.nav-previous a').attr('href');
                if (prevUrl) {
                    const { items } = await getEpisode(prevUrl);
                    bangumiItems.push(...items);
                }
            }
            return {
                title,
                items: bangumiItems
            };
        }
        catch (err) {
            console.log(err);
            return {
                title: `${err}`,
                items: [],
            };
        }
    }
    return getEpisode(`${BASE_URL}/?cat=${id}`);
};
exports.getBangumiEpisode = getBangumiEpisode;
const getM3u8Url = async (url) => {
    try {
        const response = await (0, node_fetch_1.default)(url, {
            // @ts-ignore
            credentials: 'include',
            headers: {
                Cookie: "videopassword=1",
            },
        });
        const htmlString = await response.text();
        const $ = cheerio_1.default.load(htmlString);
        const m3u8Url = $('source')?.attr('src') ?? '';
        return m3u8Url;
    }
    catch (err) {
        return '';
    }
};
exports.getM3u8Url = getM3u8Url;
const getMp4Url = async (url) => {
    return new Promise(async (reslove, reject) => {
        const page = await utilities_1.puppeteerUtil.newPage();
        await page.setCookie({
            name: '__cfduid',
            value: 'd1d62da7bd9895569c490d6f0de0c18671607486984',
            path: '/',
            domain: 'anime1.me'
        });
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('request', async (request) => {
            const url = request.url();
            if (!url.includes('://v.anime1.me/api')) {
                return;
            }
            const res = await utilities_1.axiosInstance.post(url, request.postData(), {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            reslove({
                url: `https:${res?.data?.l}`,
                setCookies: res.headers['set-cookie']
            });
        });
        // page.on('response', async (response) => {
        //   const url = response.url();
        //   if (!url.includes('://v.anime1.me/api')) {
        //     return;
        //   }
        //   // console.log(response.request().postData())
        //   const ret = await response.json() as any;
        //   reslove(`https:${ret?.l}`);
        // });
        await page.goto(url, {
            waitUntil: 'networkidle0',
        });
        // await page.evaluate(() => {
        //   document.getElementById('player').click();
        //   return;
        // });
        setTimeout(() => {
            reject('timeout.');
        }, 1000 * 15);
    });
};
exports.getMp4Url = getMp4Url;
const getBangumiPlayerById = async (id) => {
    const response = await (0, node_fetch_1.default)(`${BASE_URL}${id}`, {
        // @ts-ignore
        credentials: 'include',
        headers: {
            Cookie: "videopassword=1",
        },
    });
    const htmlString = await response.text();
    const $ = cheerio_1.default.load(htmlString);
    let src = '';
    let type = '';
    switch (true) {
        case !!$('iframe').length:
            src = $('iframe')?.attr('src');
            type = 'mp4';
            break;
        case !!$('.loadvideo')?.attr('data-src'):
            src = $('.loadvideo')?.attr('data-src');
            type = 'm3u8';
            break;
        case !!$('.youtubePlayer').attr('data-vid'):
            src = `http://www.youtube.com/watch?v=${$('.youtubePlayer').attr('data-vid')}`;
            type = 'yt';
            break;
    }
    switch (type) {
        case 'mp4':
            const { url, setCookies } = await (0, exports.getMp4Url)(src);
            return {
                type,
                url,
                setCookies
            };
        case 'm3u8':
            return {
                type,
                url: await (0, exports.getM3u8Url)(src),
            };
        case 'yt':
            return {
                type,
                url: src,
            };
        default:
            return {
                type,
                url: ''
            };
    }
};
exports.getBangumiPlayerById = getBangumiPlayerById;
const m3u8toMP4 = async (m3u8Url) => {
    return new Promise((resolve) => {
        const timestamp = +new Date();
        const filePath = path_1.default.join(__dirname, `../../videos/${timestamp}.mp4`);
        const stream = (0, convert_lib_1.m3u8toStream)(m3u8Url);
        stream.on('end', () => {
            resolve(filePath);
        });
        stream.pipe(fs_1.default.createWriteStream(filePath));
    });
};
exports.m3u8toMP4 = m3u8toMP4;
//# sourceMappingURL=anime1.lib.js.map