import * as cheerio from 'cheerio';
import * as moment from 'moment';

import { axiosInstance } from '../utilities/axios';

type BoardType = 'live' | 'new';

interface PostVM {
  id: string;
  title: string;
  text: string;
  email: string;
  oImg: string;
  sImg: string;
  name: string;
  dateTime: string;
  dateCreated: string;
  userId: string;
  warnText: string;
  reply: PostVM[];
  url?: string;
}

const BASE_URL = `http://2cat.komica.org`;

const deCodeMailProtection = (href: string): string => {
  if (!href) return '';

  const url = '/cdn-cgi/l/email-protection#';

  function r(e: string, t: number) {
    const r = e.substr(t, 2);
    return parseInt(r, 16);
  }
  function n(n: string, c: number) {
    let o = '';
    const a = r(n, c);
    for (let i = c + 2; i < n.length; i += 2) {
      const l = r(n, i) ^ a;
      o += String.fromCharCode(l);
    }

    return decodeURIComponent(escape(o));
  }

  return 'mailto: ' + n(href, url.length);
};

const getPostData = ($el: Cheerio): PostVM => {
  const id = $el.attr('id')?.replace('r', '') ?? '';
  const title = $el.find('.title')?.text() ?? '';
  const text = $el.find('.quote')?.html() ?? '';
  const email = deCodeMailProtection($el.find('a[href*="email"]')?.attr('href') as string);
  let oImg = $el.find('a[href*=\'src\']')?.attr('href') ?? '';
  let sImg = $el.find('img.img')?.attr('src') ?? '';

  if (oImg) oImg = `${BASE_URL}${oImg}`;
  if (sImg) sImg = sImg?.includes('nothumb') ? oImg : `${BASE_URL}${sImg}`;

  const name = $el.find('.name')?.text() ?? '';;
  const label = $el
    .find(`label[for="${id}"]`)
    ?.text()
    ?.replace(title, '');
  const dateTime = label?.slice(label?.indexOf('[') + 1, label?.indexOf('ID') - 1) ?? '';;
  const userId = label?.slice(label?.indexOf('ID') + 3, label?.indexOf(']')) ?? '';
  const warnText = $el.find('.warn_txt2')?.text() ?? '';

  const date = dateTime?.slice(0, dateTime?.indexOf('(')) ?? '';
  const time = dateTime?.slice(dateTime?.indexOf(')') + 1) ?? '';
  const dateCreated = moment(`20${date?.replace(/\//g, '-')}T${time}`).toISOString();

  return {
    id,
    title,
    text: text?.replace(/onclick/g, str => `__${str}`),
    email,
    oImg,
    sImg,
    name,
    dateTime,
    dateCreated,
    userId,
    warnText,
    reply: []
  };
};

export const getAllPostList = async (boardType: BoardType | string, page = 1): Promise<{ title: string, url: string, posts: any[] }> => {
  const { data: htmlString, config } = await axiosInstance.get<string>(`${BASE_URL}/~tedc21thc/${boardType}/pixmicat.php`, {
    params: {
      mode: 'module',
      load: 'mod_threadlist',
      sort: 'date',
      page: page - 1,
    }
  });

  const $ = cheerio.load(htmlString);

  const title = $('h1')?.text() ?? '';
  const url = config.url;

  const $tr = $('form table tr:not(:nth-child(1))');
  let posts = $tr.map((i, el) => {
    const $el = $(el);
    const label = $el.find('td:nth-child(6)')?.text() ?? '';
    const dateTime = label?.slice(0, label?.indexOf('ID') - 1) ?? '';

    const date = dateTime?.slice(0, dateTime?.indexOf('(')) ?? '';
    const time = dateTime?.slice(dateTime?.indexOf(')') + 1) ?? '';
    const dateCreated = moment(`20${date.replace(/\//g, '-')}T${time}`).toISOString();

    return {
      id: $el.find('input')?.attr('name') ?? '',
      title: $el.find('a')?.text() ?? '',
      replyCount: $el.find('td:nth-child(5)')?.text() ?? '',
      dateTime,
      dateCreated,
    }
  }).get();

  const $next = $('#page_switch table tr td:last-child a');
  if ($next?.length) {
    page += 1;
    const ret = await getAllPostList(boardType, page);
    posts = posts.concat(ret.posts);
  }

  return {
    title,
    url,
    posts,
  }
};

export const getPostListResult = async (boardType: BoardType | string, page: number = 1): Promise<{ posts: PostVM[], pages: string[] }> => {
  const { data: htmlString } = await axiosInstance.get<string>(`${BASE_URL}/~tedc21thc/${boardType}/pixmicat.php`, {
    params: {
      page_num: page - 1,
    }
  });

  const posts: PostVM[] = [];
  const $ = cheerio.load(htmlString);

  $('.threadpost').each((_i, el) => {
    const $el = $(el);
    const temp = getPostData($el);
    const reply: PostVM[] = [];

    $('.reply').each((_i, rEl) => {
      const $rEl = $(rEl);

      if ($rEl.find(`.qlink[href*="res=${temp.id}"]`)?.length > 0) {
        const temp2 = getPostData($rEl);
        reply.push(temp2);
      }
    });

    temp.reply = reply;

    posts.push(temp);
  });

  const pages: string[] = $('#page_switch')
    .find('a')
    .map((_i, el) => $(el).attr('href') as string).get();

  return {
    posts,
    pages
  }
};

export const getPostDetails = async (boardType: BoardType | string, resId: string): Promise<{ post: PostVM, url: string }> => {
  const { data: htmlString, config } = await axiosInstance.get<string>(`${BASE_URL}/~tedc21thc/${boardType}/pixmicat.php`, {
    params: {
      res: resId,
    }
  });

  const $ = cheerio.load(htmlString);
  const $threadpost = $('.threadpost');

  if (!$threadpost.length) {
    throw Error('該当記事がみつかりません');
  }

  const post: PostVM = getPostData($threadpost);
  post.reply = $('.reply').map((_i, rEl) => getPostData($(rEl))).get() as PostVM[];

  return {
    post,
    url: config.url
  };
};