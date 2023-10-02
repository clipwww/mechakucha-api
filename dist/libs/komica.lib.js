"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPostDetails = exports.getPostListResult = exports.getAllPostList = void 0;
const cheerio_1 = __importDefault(require("cheerio"));
const moment_1 = __importDefault(require("moment"));
const he_1 = require("he");
const utilities_1 = require("../utilities");
const urlMap = {
    new: 'https://sora.komica1.org/79/',
    live: 'https://sora.komica1.org/78/',
};
const deCodeMailProtection = (href) => {
    if (!href)
        return '';
    const url = '/cdn-cgi/l/email-protection#';
    function r(e, t) {
        const r = e.substr(t, 2);
        return parseInt(r, 16);
    }
    function n(n, c) {
        let o = '';
        const a = r(n, c);
        for (let i = c + 2; i < n.length; i += 2) {
            const l = r(n, i) ^ a;
            o += String.fromCharCode(l);
        }
        return decodeURIComponent(escape(o));
    }
    return 'mailto: ' + n(href, url.length);
};
const getPostData = ($el) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    const id = ((_a = $el.attr('id')) === null || _a === void 0 ? void 0 : _a.replace('r', '')) || '';
    const title = ((_b = $el.find('.title')) === null || _b === void 0 ? void 0 : _b.text()) || '';
    const text = ((_c = $el.find('.quote')) === null || _c === void 0 ? void 0 : _c.html()) || '';
    const email = deCodeMailProtection((_d = $el.find('a[href*="email"]')) === null || _d === void 0 ? void 0 : _d.attr('href'));
    let oImg = ((_e = $el.find('a.file-thumb')) === null || _e === void 0 ? void 0 : _e.attr('href')) || '';
    let sImg = ((_f = $el.find('a.file-thumb img')) === null || _f === void 0 ? void 0 : _f.attr('src')) || oImg;
    const name = ((_g = $el.find('.name')) === null || _g === void 0 ? void 0 : _g.text()) || '';
    ;
    const dateTime = `${((_h = $el.find('.now')) === null || _h === void 0 ? void 0 : _h.text()) || ''} ${((_j = $el.find('.now')) === null || _j === void 0 ? void 0 : _j.next().text()) || ''}`;
    const userId = ((_k = $el.find('.id')) === null || _k === void 0 ? void 0 : _k.text()) || '';
    const warnText = (_m = (_l = $el.find('.warn_txt2')) === null || _l === void 0 ? void 0 : _l.text()) !== null && _m !== void 0 ? _m : '';
    const dateCreated = (0, moment_1.default)(dateTime, 'YYYY/MM/DD HH:mm:ss').toISOString();
    return {
        id,
        title,
        text: (0, he_1.decode)(text === null || text === void 0 ? void 0 : text.replace(/onclick/g, str => `__${str}`)),
        email,
        oImg,
        sImg,
        name,
        dateTime,
        dateCreated,
        userId,
        warnText,
        reply: []
    };
};
const getAllPostList = async (boardType, page = 1) => {
    var _a;
    const url = urlMap[boardType];
    const { data: htmlString, config } = await utilities_1.axiosInstance.get(`${url}?mode=module&load=mod_threadlist`);
    const $ = cheerio_1.default.load(htmlString);
    const title = ((_a = $('h1')) === null || _a === void 0 ? void 0 : _a.text()) || '';
    const $tr = $('#topiclist tr');
    let posts = $tr.map((i, el) => {
        var _a, _b;
        const $el = $(el);
        return {
            id: ((_a = $el.find('td')) === null || _a === void 0 ? void 0 : _a.text()) || '',
            title: ((_b = $el.find('a')) === null || _b === void 0 ? void 0 : _b.text()) || '',
            replyCount: '',
            dateTime: '',
            dateCreated: '',
        };
    }).get();
    return {
        title,
        url: config.url,
        posts,
    };
};
exports.getAllPostList = getAllPostList;
const getPostListResult = async (boardType, page = 1) => {
    const url = urlMap[boardType];
    const { data: htmlString } = await utilities_1.axiosInstance.get(`${url}${page > 1 ? `/${page}.html` : ''}`, {
        headers: {
            Cookie: 'PHPSESSID=8r99s6v7iuomkadm6agk5gkgj0; cf_chl_2=325cd2a559bf14a; cf_chl_rc_m=2; theme=dark.css; _gat_gtag_UA_114117_2=1; _gat=1; __cf_bm=ffUn3GjByM2iuP06GYa5wIosmCovhLKrTEkbVKh9d_8-1674800948-0-AUPGiAD5V7Pka7DNjzmxhMRa375azBFRsVB9E9x/ft4b7EHIgbHV3HHIIT+rwmH3iVjkmXhlXDYuKNaUtHATi6N2u0pHeHPg6cpjf4VCzSyg1Hmrf++zKezYsI8bZn23i4ObIQajZrZ/oj7hgwyEHP8=',
            withCredentials: true,
        }
    }).catch(err => err.response);
    const posts = [];
    const $ = cheerio_1.default.load(htmlString);
    $('.threadpost').each((_i, el) => {
        const $el = $(el);
        const temp = getPostData($el);
        const reply = [];
        $('.reply').each((_i, rEl) => {
            var _a;
            const $rEl = $(rEl);
            if (((_a = $rEl.find(`.qlink[href*="res=${temp.id}"]`)) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                const temp2 = getPostData($rEl);
                reply.push(temp2);
            }
        });
        temp.reply = reply;
        posts.push(temp);
    });
    const pages = $('#page_switch')
        .find('a')
        .map((_i, el) => $(el).attr('href')).get();
    return {
        posts: posts.map(item => {
            return Object.assign(Object.assign({}, item), { url: `${url}/pixmicat.php?res=${item.id}` });
        }),
        pages
    };
};
exports.getPostListResult = getPostListResult;
const getPostDetails = async (boardType, resId) => {
    const url = urlMap[boardType];
    const { data: htmlString, config } = await utilities_1.axiosInstance.get(`${url}/pixmicat.php`, {
        params: {
            res: resId,
        }
    });
    const $ = cheerio_1.default.load(htmlString);
    const $threadpost = $('.threadpost');
    if (!$threadpost.length) {
        throw Error('該当記事がみつかりません');
    }
    const post = getPostData($threadpost);
    post.reply = $('.reply').map((_i, rEl) => getPostData($(rEl))).get();
    return {
        post,
        url: config.url
    };
};
exports.getPostDetails = getPostDetails;
//# sourceMappingURL=komica.lib.js.map