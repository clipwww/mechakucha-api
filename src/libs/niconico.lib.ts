import * as puppeteer from 'puppeteer';
import * as moment from 'moment';

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
  const retColor = color ? colorTable[color] : defaultColor;
  return rgbToHex(retColor.r, retColor.g, retColor.b);
};

const parseNiconicoMode = (mail: string) => {
  const line = mail.toLowerCase().split(/\s+/);
  if (line.includes('ue')) return 'TOP';
  if (line.includes('shita')) return 'BOTTOM';
  return 'RTL';
};

const parseNiconicoSize = (mail: string) => {
  const line = mail.toLowerCase().split(/\s+/);
  if (line.includes('big')) return 36;
  if (line.includes('small')) return 16;
  return 25;
};

const danmakuFilter = danmaku => {
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
      digital_time: moment.utc(vpos * 10).format('mm:ss'),
      color: parseNiconicoColor(mail),
      mode: parseNiconicoMode(mail),
      size: parseNiconicoSize(mail),
      id: no,
      user_id,
      date,
      date_iso_string: new Date(date * 1000).toISOString(),
    };
  }).filter(danmakuFilter).sort((a, b) => a.time > b.time ? 1 : -1);
};

export const getNicoNicoDanmaku = async (id: string): Promise<any[]> => {
  return new Promise(async (reslove, reject) => {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  
    const page = await browser.newPage();
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
      await browser.close();
      reslove(niconicoParser(ret));
    });
    await page.goto(`${BASE_URL}/${id}`, {
      waitUntil: 'networkidle0',
    });
    
    await page.waitFor(1000 * 15);
    await browser.close();
    reject('timeout.')
  })
}