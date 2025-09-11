import cheerio from 'cheerio';
import moment from 'moment';
import { decode } from 'he';

import { axiosInstance, sleep, puppeteerUtil } from '../utilities';

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
  new: 'https://gaia.komica1.org/79/',
  live: 'https://gaia.komica1.org/78/',
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

  const dateCreated = moment(dateTime, 'YYYY/MM/DD HH:mm:ss').toISOString();

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

export const getAllPostList = async (boardType: BoardType | string, page = 0, maxPage = 5): Promise<{ title: string, url: string, posts: any[] }> => {
  try {
    const url = urlMap[boardType]
    if (page >= maxPage) {
      return {
        posts: [],
        title: '',
        url: ''
      }
    }
    if (page > 0) {
      await sleep(.5)
    }
    const { data: htmlString, config } = await axiosInstance.get<string>(`${url}/pixmicat.php?mode=module&load=mod_threadlist&page=${page}`);

    const $ = cheerio.load(htmlString);

    const title = $('h1')?.text() || '';

    maxPage = $('#page_switch tr td:nth-child(2) a')?.length || maxPage;

    const $tr = $('#contents tr');

    let posts = $tr.map((i, el) => {
      const $el = $(el);

      return {
        id: $el.find('td:nth-child(1)')?.text() || '',
        title: $el.find('a')?.text() || '',
        replyCount: +$el.find('td:nth-child(4)')?.text(),
        dateTime: '',
        dateCreated: '',
        dateUpdated: moment($el.find('td:nth-child(5)').text(), 'YYYY/MM/DD HH:mm:ss').toISOString(),
        url: url + '/' + $el.find('a')?.attr('href') || '',
      }
    }).get().filter(item => !!item?.id);


    return {
      title,
      url: config.url,
      posts: posts.concat((await getAllPostList(boardType, page + 1, maxPage)).posts),
    }
  } catch (err) {
    console.error(err)
    return {
      posts: [],
      title: '',
      url: ''
    }
  }
};

export const getPostListResult = async (boardType: BoardType | string, page: number = 1): Promise<{ posts: PostVM[], pages: string[] }> => {
  const url = urlMap[boardType]
  const { data: htmlString } = await axiosInstance.get<string>(`${url}${page > 1 ? `/${page}.html` : ''}`, {
    headers: {
      Cookie: 'PHPSESSID=8r99s6v7iuomkadm6agk5gkgj0; cf_chl_2=325cd2a559bf14a; cf_chl_rc_m=2; theme=dark.css; _gat_gtag_UA_114117_2=1; _gat=1; __cf_bm=ffUn3GjByM2iuP06GYa5wIosmCovhLKrTEkbVKh9d_8-1674800948-0-AUPGiAD5V7Pka7DNjzmxhMRa375azBFRsVB9E9x/ft4b7EHIgbHV3HHIIT+rwmH3iVjkmXhlXDYuKNaUtHATi6N2u0pHeHPg6cpjf4VCzSyg1Hmrf++zKezYsI8bZn23i4ObIQajZrZ/oj7hgwyEHP8=',
      withCredentials: true,
    }
  }).catch(err => err.response);

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
  const { data: htmlString, config } = await axiosInstance.get<string>(`${url}/pixmicat.php`, {
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