import { Router } from 'express';

import { getAllPostList, getPostDetails, getPostListResult } from '../libs/komica.lib';
import { ResultCode, ResultListGenericVM, ResultGenericVM } from '../view-models/result.vm';
import { ResponseExtension } from '../view-models/extension.vm';

const router = Router();

router.get('/:board', async (req, res: ResponseExtension, next) => {
  try {
    const { board } = req.params;
    const { p = 1, mode = '' } = req.query

    const result = new ResultListGenericVM();

    switch (mode) {
      case 'all':
        {
          const { title, url, posts } = await getAllPostList(board);
          result.items = posts;
          result.item = {
            title,
            url,
          }
        }
        break;
      default:
        const { posts, pages } = await getPostListResult(board, +p);
        result.items = posts;
        result['pages'] = pages;
    }

    res.result = result.setResultValue(true, ResultCode.success)

    next();
  } catch (err) {
    next(err);
  }
})

router.get('/:board/:id', async (req, res: ResponseExtension, next) => {
  try {
    const { board, id } = req.params;

    const result = new ResultGenericVM();
    const { post, url } = await getPostDetails(board, id);
    result.item = {
      ...post,
      url
    }

    res.result = result.setResultValue(true, ResultCode.success)

    next();
  } catch (err) {
    next(err)
  }
});

export default router;