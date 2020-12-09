import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import path from 'path';
import fs from 'fs';

import { m3u8toStream } from '../libs/convert.lib';
import { puppeteerUtil } from '../utilities'

export interface Anime1ListVM {
  id: string;
  name: string;
  description?: string;
}

export interface Anime1BangumiVM {
  id: string;
  name: string;
  type: 'mp4' | 'm3u8';
  m3u8Url?: string;
  mp4Url?: string;
  iframeSrc?: string;
  datePublished?: string;
}

const BASE_URL = 'https://anime1.me/';

export const getBangumiList = async (): Promise<Anime1ListVM[]> => {
  const response = await fetch(BASE_URL);
  const htmlString = await response.text();

  const $ = cheerio.load(htmlString);

  const names = $('#tablepress-1 .column-1 a');
  const descriptions = $('#tablepress-1 td.column-2');
  return names.map((i, el) => {
    const $el = $(el);
    return {
      id: ($el.attr('href') || '').replace('/?cat=', ''),
      name: $el.text(),
      description: $(descriptions[i]).text()
    } as Anime1ListVM;
  }).get();
}

export const getBangumiEpisode = async (id: string) => {
  async function getEpisode(url: string): Promise<{ title: string, items: Anime1BangumiVM[] }> {
    try {
      const response = await fetch(url, {
        // @ts-ignore
        credentials: 'include',
        headers: {
          Cookie: "videopassword=1",
        },
      });
      const htmlString = await response.text();

      const bangumiItems: Anime1BangumiVM[] = [];
      const $ = cheerio.load(htmlString);

      const title = $('.page-title')?.text() ?? '';
      const bangumis = $('[id*="post-"]');

      for (let i = 0; i < bangumis.length; i++) {
        const $el = $(bangumis[i]);
        const iframeSrc = $el.find('iframe')?.attr('src') ?? $el.find('.loadvideo')?.attr('data-src');
        const type = $el.find('iframe').length ? 'mp4' : 'm3u8';



        bangumiItems.push({
          id: $el.attr('id')?.replace('post-', '') ?? '',
          name: $el.find('.entry-title')?.text() ?? '',
          type,
          iframeSrc,
          datePublished: $el.find('.published')?.attr('datetime'),
        } as Anime1BangumiVM)
      }


      if ($('.nav-previous a').length) {
        const prevUrl = $('.nav-previous a').attr('href') as string;
        if (prevUrl) {
          const { items } = await getEpisode(prevUrl)
          bangumiItems.push(...items)
        }
      }

      return {
        title,
        items: bangumiItems
      };
    } catch (err) {
      console.log(err);
      return {
        title: '',
        items: [],
      };
    }
  }

  return getEpisode(`${BASE_URL}/?cat=${id}`);
}


export const getM3u8Url = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url, {
      // @ts-ignore
      credentials: 'include',
      headers: {
        Cookie: "videopassword=1",
      },
    });
    const htmlString = await response.text();

    const $ = cheerio.load(htmlString);
    const m3u8Url = $('source')?.attr('src') ?? '';

    return m3u8Url;
  } catch (err) {
    return '';
  }
}

export const getMp4Url = async (url: string): Promise<string> => {
  return new Promise(async (reslove, reject) => {
    const page = await puppeteerUtil.newPage();
    await page.setCookie({
      name: '__cfduid',
      value: 'd1d62da7bd9895569c490d6f0de0c18671607486984',
      path: '/',
      domain: 'anime1.me'
    });
    // page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    page.on('response', async response => {
      const url = response.url();
      if (!url.includes('://v.anime1.me/api')) {
        return;
      }

      // console.log(response.request().postData())

      const ret = await response.json() as any;
      reslove(`https:${ret?.l}`);
    });
    await page.goto(url, {
      waitUntil: 'networkidle0',
    });
    await page.evaluate(() => {
      document.getElementById('player').click();
      return;
    });

    await page.waitFor(1000 * 15);

    reject('timeout.')
  })
}

export const getBangumiPlayerById = async (id: string) => {
  const response = await fetch(`${BASE_URL}${id}`, {
    // @ts-ignore
    credentials: 'include',
    headers: {
      Cookie: "videopassword=1",
    },
  });
  const htmlString = await response.text();
  const $ = cheerio.load(htmlString);

  const url = $('iframe')?.attr('src') ?? $('.loadvideo')?.attr('data-src');
  const type = $('iframe').length ? 'mp4' : 'm3u8';


  switch (type) {
    case 'mp4':
      return {
        type,
        url: await getMp4Url(url),
      };
    case 'm3u8':
      return {
        type,
        url: await getM3u8Url(url),
      }
    default:
      return {
        type,
        url: ''
      };
  }
}

export const m3u8toMP4 = async (m3u8Url: string): Promise<string> => {
  return new Promise((resolve) => {
    const timestamp = +new Date();
    const filePath = path.join(__dirname, `../video/${timestamp}.mp4`);
    const stream = m3u8toStream(m3u8Url);

    stream.on('end', () => {
      resolve(filePath);
    });

    stream.pipe(fs.createWriteStream(filePath))
  })

}