"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchMetaData = void 0;
const cheerio_1 = __importDefault(require("cheerio"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const utilities_1 = require("../utilities");
const handleURL = (url) => {
    const urlObj = new URL(url.trim());
    if (urlObj.hostname.includes('facebook')) {
        urlObj.hostname = 'mobile.facebook.com';
    }
    return urlObj.href;
};
const createValidUri = (url, path) => {
    const urlObj = new URL(url);
    if (path.includes(urlObj.host)) {
        return path;
    }
    const updatedPath = path.replace('/', '');
    return `${urlObj.host}${updatedPath}`;
};
const fetchMetaData = async (url) => {
    const urlString = handleURL(url);
    let htmlString = '';
    if (/youtube.com|twitter.com/g.test(urlString)) {
        const page = await utilities_1.puppeteerUtil.newPage();
        await page.goto(urlString, {
            waitUntil: 'networkidle0',
        });
        htmlString = await page.evaluate(() => {
            return document.documentElement.innerHTML;
        });
    }
    else {
        const response = await (0, node_fetch_1.default)(urlString, {
            method: 'GET',
            headers: {
                'User-Agent': 'MetaFetcher'
            }
        });
        htmlString = await response.text();
    }
    const $ = cheerio_1.default.load(htmlString);
    const basic = {
        url: urlString,
        title: $('title').text(),
        description: $('meta[name=description]').attr('content')
    };
    const opengraph = {};
    $('meta[property]').each((_, meta) => {
        const key = $(meta).attr('property');
        const content = $(meta).attr('content');
        opengraph[key] = content;
    });
    const opengraph_social = {};
    $('meta[name]').each((_, meta) => {
        const key = $(meta).attr('name');
        const content = $(meta).attr('content');
        opengraph_social[key] = content;
    });
    const itemprop = {};
    $('[itemprop]').each((_, meta) => {
        const key = $(meta).attr('itemprop');
        const content = $(meta).attr('content');
        const href = $(meta).attr('href');
        itemprop[key] = content || href;
    });
    const favicons = $('link[rel]')
        .filter((_, el) => {
        const href = $(el).attr('href');
        return href.includes('shortcut icon') || href.includes('icon') || href.includes('apple-touch-startup-image') || href.includes('apple-touch-icon');
    }).map((_, el) => {
        const href = $(el).attr('href');
        return createValidUri(urlString, href);
    }).get();
    return {
        ...basic,
        opengraph,
        opengraph_social,
        itemprop,
        favicons,
    };
};
exports.fetchMetaData = fetchMetaData;
//# sourceMappingURL=meta-fetcher.lib.js.map