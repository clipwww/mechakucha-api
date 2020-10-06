import * as cheerio from 'cheerio';
import fetch from 'node-fetch';

const handleURL = (url: string): string => {
  const urlObj = new URL(url.trim());
  if (urlObj.hostname.includes('facebook')) {
    urlObj.hostname = 'mobile.facebook.com';
  }
  return urlObj.href;
}

const createValidUri = (host: string, path: string): string => {
  if (path.includes(host)) {
    return path;
  }

  const updatedPath = path.replace('/', '');
  return `${host}${updatedPath}`;
};

export const fetchMetaData = async (url: string): Promise<any> => {
  const urlString: string = handleURL(url);

  const response = await fetch(urlString, {
    method: 'GET'
  });
  const htmlString = await response.text();
  const $ = cheerio.load(htmlString);
  const $head = $('head');

  const basic = {
    url: response.url,
    title: $head.find('title').text(),
    description: $head.find('meta[name=description]').attr('content')
  }

  const opengraph = {};
  $head.find('meta[property]').each((_, meta) => {
    const property = $(meta).attr('property');
    const content = $(meta).attr('content');
    
    if (!property.includes('twitter')) {
      opengraph[property] = content;
    }
  })

  const opengraph_social = {};
  $head.find('meta[name]').each((_, meta) => {
    const property = $(meta).attr('name');
    const content = $(meta).attr('content');

    if (property.includes('twitter')) {
      opengraph_social[property] = content;
    }
  });

  const favicons = $head.find('link[rel]')
  .filter((_, el) => {
    const href = $(el).attr('href');
    return href.includes('shortcut icon') || href.includes('icon') || href.includes('apple-touch-startup-image') || href.includes('apple-touch-icon')
  }).map((_, el) => {
    const href = $(el).attr('href');
    return createValidUri(response.url, href)
  }).get();


  return {
    ...basic,
    opengraph,
    opengraph_social,
    favicons,
  };
}
