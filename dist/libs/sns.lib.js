"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.crawlerInstagramHashTag = exports.crawlerInstagramFanPage = exports.crawlerFacebookFanPage = void 0;
const cheerio_1 = __importDefault(require("cheerio"));
const moment_1 = __importDefault(require("moment"));
const utilities_1 = require("../utilities");
const crawlerFacebookFanPage = async (fbId) => {
    const url = `https://www.facebook.com/pg/${fbId}/posts`;
    // const page = await puppeteerUtil.newPage();
    // await page.goto(url, {
    //   waitUntil: 'networkidle0',
    // });
    // const htmlString = await page.evaluate(() => {
    //   return document.body.innerHTML
    // });
    const { data: htmlString } = await utilities_1.axiosInstance.get(url, {
        headers: {
            'Content-Language': 'zh-TW'
        }
    });
    const $ = cheerio_1.default.load(htmlString);
    const id = $('[data-referrerid]').attr('data-referrerid');
    console.log(id);
    return {
        id,
        name: $('.fwb').first().text(),
        logo: $('.uiScaledImageContainer img').attr('src'),
        posts: $('.userContentWrapper').map((_i, el) => {
            const $el = $(el);
            const utime = +($el.find('[data-utime]').attr('data-utime') || 0) * 1000;
            return {
                id: $el.find('.text_exposed_root').attr('id'),
                link: `https://www.facebook.com/${$el.find('a._5pcq').attr('href')}`,
                logo: $el.find('img').attr('src'),
                img: $el.find('.scaledImageFitHeight').attr('src') || $el.find('.scaledImageFitWidth').attr('src') || $el.find('._3chq').attr('src'),
                content: $el.find('[data-testid="post_message"]').html(),
                utime,
                formatTime: (0, moment_1.default)(utime).utcOffset(480).format('YYYY/MM/DD HH:mm'),
                timestampContent: $el.find('.timestampContent').text(),
            };
        }).get(),
    };
};
exports.crawlerFacebookFanPage = crawlerFacebookFanPage;
const crawlerInstagramFanPage = async (igAccount) => {
    let igId = igAccount;
    if (isNaN(+igAccount)) {
        const { data } = await utilities_1.axiosInstance.get(`https://www.instagram.com/${igAccount}/?__a=1`, {
            withCredentials: true,
            headers: {
                Cookie: "ds_user_id=1268817115; Domain=.instagram.com; expires=Tue, 09-Nov-2021 04:12:52 GMT; Max-Age=7776000; Path=/;Secure"
            }
        });
        // console.log(data)
        const id = data?.graphql?.user?.id ?? '';
        if (id)
            igId = id;
    }
    console.log('igId', igId);
    const { data: ret } = await utilities_1.axiosInstance.get('https://www.instagram.com/graphql/query', {
        params: {
            query_hash: 'e769aa130647d2354c40ea6a439bfc08',
            variables: JSON.stringify({
                id: igId,
                first: 12,
            })
        }
    });
    if (!ret.status || ret.status.toLowerCase() !== 'ok') {
        throw Error(ret.message);
    }
    const edges = ret.data.user.edge_owner_to_timeline_media.edges;
    if (!edges.length) {
        throw Error('Empty');
    }
    return ret?.data?.user?.edge_owner_to_timeline_media?.edges.map(item => {
        return {
            href: `https://www.instagram.com/p/${item.node?.shortcode}`,
            src: item.node?.display_url,
            ...item.node
        };
    });
};
exports.crawlerInstagramFanPage = crawlerInstagramFanPage;
const crawlerInstagramHashTag = async (tag, end_cursor) => {
    const params = {
        __a: 1,
    };
    if (end_cursor) {
        params['max_id'] = end_cursor;
    }
    const { data } = await utilities_1.axiosInstance.get(`https://www.instagram.com/explore/tags/${tag}/`, {
        params,
    });
    return {
        posts: data.graphql.hashtag.edge_hashtag_to_media.edges.map(edge => edge.node),
        page_info: data.graphql.hashtag.edge_hashtag_to_media.page_info
    };
};
exports.crawlerInstagramHashTag = crawlerInstagramHashTag;
//# sourceMappingURL=sns.lib.js.map