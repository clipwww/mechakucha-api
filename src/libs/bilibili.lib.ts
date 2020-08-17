import * as cheerio from 'cheerio';
import * as moment from 'moment';
import fetch from 'node-fetch';


const parseRgb256IntegerColor = (color: string) => {
  const rgb = parseInt(color, 10);
  const r = (rgb >>> 4) & 0xff;
  const g = (rgb >>> 2) & 0xff;
  const b = (rgb >>> 0) & 0xff;
  return `rgb(${r},${g},${b})`;
};


export const getBiliBiliDanmaku = async (id: string): Promise<any[]> => {
  const response = await fetch(`https://api.bilibili.com/x/v1/dm/list.so?oid=${id}`);
  const xmlString = await response.text();

  const $ = cheerio.load(xmlString, {
    xmlMode: true,
  })

  return $('d').map((i, el) => {
    const $d = $(el);
    const p = $d.attr('p');
    const [time, mode, size, color, create, bottom, sender, id] = p.split(',');
    return {
      id,
      sender,
      text: $d.text(),
      msg: $d.text(),
      time: +time,
      digital_time: moment.utc(+time * 1000).format('HH:mm:ss'),
      // We do not support ltr mode
      mode: [null, 'rtl', 'rtl', 'rtl', 'bottom', 'top'][+mode],
      size: +size,
      color: parseRgb256IntegerColor(color),
      bottom: +bottom > 0,
      date: create,
      date_iso_string: new Date(+create * 1000).toISOString(),
    };
  }).get().sort((a, b) => a.time > b.time ? 1 : -1);
}