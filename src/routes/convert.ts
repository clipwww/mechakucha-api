import { Hono } from 'hono';

import { lruCache } from '../utilities/lru-cache';
import { m3u8toStream } from '../libs/convert.lib';

const app = new Hono();

/**
 * @api {get} /convert/m3u8toMp4?url M3u8 轉 Mp4
 * @apiName ConvertM3u8toMp4
 * @apiGroup 轉檔工具
 * @apiVersion 1.0.0
 *
 * @apiParam {String} url 欲轉換的m3u8網址
 *
 *
 */
app.get('/m3u8toMp4', async (c) => {
  try {
    const { url, name } = c.req.query();

    if (!url) {
      throw new Error('`url` is empty.')
    }

    const stream = m3u8toStream(url as string);

    // 在 Hono 中處理流式響應
    c.header('Content-disposition', `attachment; filename=${name || +new Date()}.mp4`);
    c.header('Content-type', 'video/mp4');

    // 臨時：返回一個簡單的響應，稍後改進流處理
    return c.text('Stream conversion in progress...', 200);
  } catch (err) {
    throw err;
  }
})

export default app;