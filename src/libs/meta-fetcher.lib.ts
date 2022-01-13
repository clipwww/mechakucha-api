import  cheerio from 'cheerio';
import fetch from 'node-fetch';
import { puppeteerUtil } from '../utilities'


const handleURL = (url: string): string => {
  const urlObj = new URL(url.trim());
  if (urlObj.hostname.includes('facebook')) {
    urlObj.hostname = 'mobile.facebook.com';
  }
  return urlObj.href;
}

const createValidUri = (url: string, path: string): string => {
  const urlObj = new URL(url);
  if (path.includes(urlObj.host)) {
    return path;
  }

  const updatedPath = path.replace('/', '');
  return `${urlObj.host}${updatedPath}`;
};

export const fetchMetaData = async (url: string): Promise<any> => {
  const urlString: string = handleURL(url);
  let htmlString = '';

  if (/youtube.com|twitter.com/g.test(urlString)) {
    const page = await puppeteerUtil.newPage();
    await page.goto(urlString, {
      waitUntil: 'networkidle0',
    });
    htmlString = await page.evaluate(() => {
      return document.documentElement.innerHTML;
    });
  } else {
    const response = await fetch(urlString, {
      method: 'GET',
      headers: {
        'User-Agent': 'MetaFetcher'
      }
    });
    htmlString = await response.text();
  }


  const $ = cheerio.load(htmlString);

  const basic = {
    url: urlString,
    title: $('title').text(),
    description: $('meta[name=description]').attr('content')
  }

  const opengraph = {};
  $('meta[property]').each((_, meta) => {
    const key = $(meta).attr('property');
    const content = $(meta).attr('content');

    opengraph[key] = content;
  })

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
      return href.includes('shortcut icon') || href.includes('icon') || href.includes('apple-touch-startup-image') || href.includes('apple-touch-icon')
    }).map((_, el) => {
      const href = $(el).attr('href');
      return createValidUri(urlString, href)
    }).get();


  return {
    ...basic,
    opengraph,
    opengraph_social,
    itemprop,
    favicons,
  };
}
