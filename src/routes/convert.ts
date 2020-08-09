import { Router } from 'express';

import { lruCache } from '../utilities/lru-cache';
import { m3u8toStream } from '../libs/convert.lib';
import { ResponseExtension } from '../view-models/extension.vm';

const router = Router();

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
router.get('/m3u8toMp4', async (req, res: ResponseExtension, next) => {
  try {
    const { url, name } = req.query;

    if (!url) {
      throw Error('`url` is empty.')
    }

    const stream = m3u8toStream(url as string);

    res.setHeader('Content-disposition', `attachment; filename=${name || +new Date()}.mp4`);
    res.setHeader('Content-type', 'video/mp4');

    stream.pipe(res)
  } catch (err) {
    next(err);
  }
})

export default router;