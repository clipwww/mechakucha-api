import  moment from 'moment';
import { XMLParser } from 'fast-xml-parser';
import fetch from 'node-fetch';
import  cheerio from 'cheerio';
import { decode } from 'he';

import { puppeteerUtil } from '../utilities'

const xmlParser = new XMLParser();
const BASE_URL = `https://www.nicovideo.jp/watch`;

function componentToHex(c: number) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r: number, g: number, b: number) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

const parseNiconicoColor = (mail: string) => {
  const colorTable = {
    red: { r: 255, g: 0, b: 0 },
    pink: { r: 255, g: 128, b: 128 },
    orange: { r: 255, g: 184, b: 0 },
    yellow: { r: 255, g: 255, b: 0 },
    green: { r: 0, g: 255, b: 0 },
    cyan: { r: 0, g: 255, b: 255 },
    blue: { r: 0, g: 0, b: 255 },
    purple: { r: 184, g: 0, b: 255 },
    black: { r: 0, g: 0, b: 0 },
  };
  const defaultColor = { r: 255, g: 255, b: 255 };
  const line = mail.toLowerCase().split(/\s+/);
  const color = Object.keys(colorTable).find(color => line.includes(color));
  const retColor = color ? (colorTable as any)[color] : defaultColor;
  return rgbToHex(retColor.r, retColor.g, retColor.b);
};

const parseNiconicoMode = (mail: string) => {
  const line = mail.toLowerCase().split(/\s+/);
  if (line.includes('ue')) return 'top';
  if (line.includes('shita')) return 'bottom';
  return 'rtl';
};

const parseNiconicoSize = (mail: string) => {
  const line = mail.toLowerCase().split(/\s+/);
  if (line.includes('big')) return 36;
  if (line.includes('small')) return 16;
  return 25;
};

const danmakuFilter = (danmaku: any) => {
  if (!danmaku) return false;
  if (!danmaku.text) return false;
  if (!danmaku.mode) return false;
  if (!danmaku.size) return false;
  if (danmaku.time < 0 || danmaku.time >= 360000) return false;
  return true;
};

const niconicoParser = (resultArray: any[]) => {
  const chatList = resultArray.map(item => item.chat).filter(x => x);
  return chatList.map(comment => {
    if (!comment.content || !(comment.vpos >= 0) || !comment.no) return null;
    const { vpos, mail = '', content, no, user_id, date } = comment;
    return {
      text: content,
      time: vpos / 100,
      digital_time: moment.utc(vpos * 10).format('HH:mm:ss'),
      color: parseNiconicoColor(mail),
      mode: parseNiconicoMode(mail),
      size: parseNiconicoSize(mail),
      id: no,
      user_id,
      date,
      date_iso_string: new Date(date * 1000).toISOString(),
    };
  }).filter(danmakuFilter).sort((a, b) => (a?.time || 0) > (b?.time || 0) ? 1 : -1);
};

export const getNicoNicoDanmaku = async (id: string): Promise<any[]> => {
  return new Promise(async (reslove, reject) => {
    const page = await puppeteerUtil.newPage();
    await page.setCookie({
      name: 'lang',
      value: 'ja-jp',
      path: '/',
      domain: '.nicovideo.jp'
    });
    // page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    page.on('response', async response => {
      const url = response.url();
      if (!url.includes('://nmsg.nicovideo.jp/api.json')) {
        return;
      }

      // console.log(response.request().postData())

      const ret = await response.json() as any[];
      reslove(niconicoParser(ret));
    });
    await page.goto(`${BASE_URL}/${id}`, {
      waitUntil: 'networkidle0',
    });

    setTimeout(() => {
      reject('timeout.')
    }, 1000 * 15)
  })
}

export async function getRankingList(type = 'all', term = '24h'): Promise<{
  id: string;
  title: string;
  link: string;
  pubDate: string;
  thumbnailSrc: string;
  description: string;
  originDescription: string;
  memo: string;
  timeLength: string;
  nicoInfoDate: string;
  totalView: number;
  commentCount: number;
  mylistCount: number;
}[]> {
  const response = await fetch(`https://www.nicovideo.jp/ranking/genre/${type}?term=${term}&rss=2.0&lang=ja-jp`);
  const xmlString = await response.text();

  const { rss } = xmlParser.parse(xmlString);

  rss.channel.pubDate = moment(rss.channel.pubDate);
  rss.channel.lastBuildDate = moment(rss.channel.lastBuildDate);

  return rss.channel.item.map((item: any) => {
    const $ = cheerio.load(`<div>${item.description}</div>`);
    const url = new URL(item.link)

    return {
      ...item,
      id: url.pathname.replace('/watch/', ''),
      pubDate: moment(item.pubDate).toISOString(),
      description: decode($('.nico-description').html() || ''),
      originDescription: item.description,
      memo: $('.nico-memo').text() || '',
      timeLength: $('.nico-info-length').text() || '',
      nicoInfoDate: $('.nico-info-date').text() || '',
      totalView: +$('.nico-info-total-view').text().replace(/,/g, ''),
      commentCount: +$('.nico-info-total-res').text().replace(/,/g, ''),
      mylistCount: +$('.nico-info-total-mylist').text().replace(/,/g, ''),
      thumbnailSrc: $('.nico-thumbnail img').attr('src') || '',
    };
  });

};