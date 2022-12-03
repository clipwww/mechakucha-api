import  cheerio from 'cheerio';
import  moment from 'moment';
import { decode } from 'he';

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

const urlMap = {
  new: 'https://sora.komica.org/79/',
  live: 'https://sora.komica.org/78/',
}

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

const getPostData = ($el: cheerio.Cheerio): PostVM => {
  const id = $el.attr('id')?.replace('r', '') || '';
  const title = $el.find('.title')?.text() || '';
  const text = $el.find('.quote')?.html() || '';
  const email = deCodeMailProtection($el.find('a[href*="email"]')?.attr('href') as string);
  let oImg = $el.find('a.file-thumb')?.attr('href') || '';
  let sImg = $el.find('a.file-thumb img')?.attr('src') || oImg;

  const name = $el.find('.name')?.text() || '';;
  const dateTime = `${$el.find('.now')?.text() || ''} ${$el.find('.now')?.next().text() || ''}`;
  const userId = $el.find('.id')?.text() || '';
  const warnText = $el.find('.warn_txt2')?.text() ?? '';

  const date = dateTime?.slice(0, dateTime?.indexOf('(')) ?? '';
  const time = dateTime?.slice(dateTime?.indexOf(')') + 1) ?? '';
  const dateCreated = moment(`20${date?.replace(/\//g, '-')}T${time}`).toISOString();

  return {
    id,
    title,
    text: decode(text?.replace(/onclick/g, str => `__${str}`)),
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
  const url = urlMap[boardType]
  const { data: htmlString, config } = await axiosInstance.get<string>(`${url}`);

  const $ = cheerio.load(htmlString);

  const title = $('h1')?.text() || '';

  const $tr = $('#topiclist tr');
  let posts = $tr.map((i, el) => {
    const $el = $(el);

    return {
      id: $el.find('td')?.text() || '',
      title: $el.find('a')?.text() || '',
      replyCount: '', // TODO: 解析出 replyCount
      dateTime: '',
      dateCreated: '',
    }
  }).get();

  return {
    title,
    url:config.url,
    posts,
  }
};

export const getPostListResult = async (boardType: BoardType | string, page: number = 1): Promise<{ posts: PostVM[], pages: string[] }> => {
  const url = urlMap[boardType]
  const { data: htmlString } = await axiosInstance.get<string>(`${url}${page > 1 ? `/${page}.html` : ''}`);

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
    posts: posts.map(item => {
      return {
        ...item,
        url: `${url}/pixmicat.php?res=${item.id}`,
      }
    }),
    pages
  }
};

export const getPostDetails = async (boardType: BoardType | string, resId: string): Promise<{ post: PostVM, url: string }> => {
  const url = urlMap[boardType]
  const { data: htmlString, config } = await axiosInstance.get<string>( `${url}/pixmicat.php`, {
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