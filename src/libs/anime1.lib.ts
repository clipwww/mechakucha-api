import  cheerio from 'cheerio';
import fetch from 'node-fetch';
import  path from 'path';
import  fs from 'fs';
import  FormData from 'form-data';

import { m3u8toStream } from '../libs/convert.lib';
import { puppeteerUtil, axiosInstance } from '../utilities'

export interface Anime1ListVM {
  id: string;
  name: string;
  description?: string;
  year?: string;
  season?: string;
  fansub?: string;
}

export interface Anime1BangumiVM {
  id: string;
  name: string;
  type: 'mp4' | 'm3u8' | 'yt';
  m3u8Url?: string;
  mp4Url?: string;
  iframeSrc?: string;
  datePublished?: string;
}

const BASE_URL = 'https://anime1.me/';

export const getBangumiList = async (): Promise<Anime1ListVM[]> => {
  const response = await fetch(`https://d1zquzjgwo9yb.cloudfront.net/?_=${+new Date()}`);
  const animeList: Array<Array<string>> = await response.json();


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
}

export const getBangumiEpisode = async (id: string) => {
  async function getEpisode(url: string): Promise<{ title: string, items: Anime1BangumiVM[] }> {
    try {
      const { data: htmlString } = await axiosInstance.get(url, {
        // @ts-ignore
        credentials: 'include',
        headers: {
          Cookie: "videopassword=1",
        },
      });
      console.log(htmlString)

      const bangumiItems: Anime1BangumiVM[] = [];
      const $ = cheerio.load(htmlString);

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
              const formData = new FormData()
              formData.append('d', decodeURIComponent($el.find('video').attr('data-apireq')))

               const { data } = await axiosInstance.post('https://v.anime1.me/api', formData, {
                headers: {
                  ...formData.getHeaders()
                },
              })
              iframeSrc = data.s[0].src
              type = 'mp4';
              console.log(iframeSrc)
            } catch(error) {
              iframeSrc = `${error}`
            }
            
            break;
        }

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
        title: `${err}`,
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

export const getMp4Url = async (url: string): Promise<{ url: string, setCookies: string[] }> => {
  return new Promise(async (reslove, reject) => {
    const page = await puppeteerUtil.newPage();
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
 
      const res = await axiosInstance.post(url, request.postData(), {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })

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
      reject('timeout.')
    }, 1000 * 15)
  })
}

export const getBangumiPlayerById = async (id: string): Promise<{ type: string, url: string, setCookies?: string[] }> => {
  const response = await fetch(`${BASE_URL}${id}`, {
    // @ts-ignore
    credentials: 'include',
    headers: {
      Cookie: "videopassword=1",
    },
  });
  const htmlString = await response.text();
  const $ = cheerio.load(htmlString);

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
      const { url, setCookies } =  await getMp4Url(src);
      return {
        type,
        url,
        setCookies
      };
    case 'm3u8':
      return {
        type,
        url: await getM3u8Url(src),
      }
    case 'yt':
      return {
        type,
        url: src,
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
    const filePath = path.join(__dirname, `../../videos/${timestamp}.mp4`);
    const stream = m3u8toStream(m3u8Url);

    stream.on('end', () => {
      resolve(filePath);
    });

    stream.pipe(fs.createWriteStream(filePath))
  })

}