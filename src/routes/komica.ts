import { Router } from 'express';

import { getAllPostList, getPostDetails, getPostListResult } from '../libs/komica.lib';
import { ResultCode, ResultListGenericVM, ResultGenericVM } from '../view-models/result.vm';
import { ResponseExtension } from '../view-models/extension.vm';

const router = Router();

/**
 * @api {get} /komica/:board/?p=1&mode= 取得看板文章列表
 * @apiName GetKomicaPosts
 * @apiGroup 糟糕島
 * @apiVersion 1.0.0
 *
 * @apiParam {String} board 看板:`live` 新番實況、`new` 新番捏他
 * @apiParam {Number} p=1 頁數
 * @apiParam {String} mode=null 模式: `all`顯示所有文章
 *
 * @apiSuccessExample Success Response
{
  "success": true,
  "resultCode": "200",
  "resultMessage": "",
  "items": [
    {
      "id": "2269359",
      "title": "デジモンアドベンチャー：第9話「完全体・襲来」",
      "text": "",
      "email": "",
      "oImg": "http://2cat.komica.org/~tedc21thc/live/src/1596335896226.jpg",
      "sImg": "http://2cat.komica.org/~tedc21thc/live/thumb/1596335896226s.jpg",
      "name": "",
      "dateTime": "20/08/02(日)10:38",
      "dateCreated": "2020-08-02T02:38:00.000Z",
      "userId": "bi4zkfzc/pu4N",
      "warnText": "レス 130 件省略。全て読むには返信ボタンを押してください。",
      "reply": []
    }
  ],
  "pages": [
    "1.htm?",
    "2.htm?",
    "3.htm?",
    "4.htm?",
    "pixmicat.php?page_num=5",
    "pixmicat.php?page_num=6",
    "pixmicat.php?page_num=7"
  ]
}
 *
 * @apiSuccessExample mode=all
{
  "success": true,
  "resultCode": "200",
  "resultMessage": "",
  "items": [
    {
      "id": "2269359",
      "title": "デジモンアドベンチャー：第9話「完全体・襲来」",
      "replyCount": "140",
      "dateTime": "20/08/02(日)10:38",
      "dateCreated": "2020-08-02T02:38:00.000Z"
    },
  ],
  "item": {
    "title": "二次元新番實況＠２ＣＡＴ",
    "url": "http://2cat.komica.org/~tedc21thc/live/pixmicat.php"
  }
}
 */
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