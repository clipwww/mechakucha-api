// import fetch from 'node-fetch';
import  cheerio from 'cheerio';
import { tify as originTify } from 'chinese-conv';
import { decode } from 'he';

import { axiosInstance } from '../utilities';

function tify(value: string = '') {
  return originTify(value || '');
}

const BASE_URL = 'https://www.agemys.org';

interface SimpleAnimeVM {
  id: string;
  name: string;
  wd: number;
  isnew: boolean;
  mttime: Date | string;
  namefornew: string;
}

interface EpisodeVM {
  id: string;
  pId: string;
  eId: string;
  href: string;
  title: string;
}

declare global {
  interface Window {
    new_anime_list: SimpleAnimeVM[];
    __yx_SetMainPlayIFrameSRC: Function;
    __age_cb_getplay_url: Function;
  }
}

export const getAnimeList = async () => {
  const { data: htmlString } = await axiosInstance.get(BASE_URL) 
  const $ = cheerio.load(htmlString);

  let animeList = []

  $('.tab-pane').each((i, pel) => {
    const $pel = $(pel)
    const id = $pel.attr('id')

    const tempList = $pel.find('li').map((i, el) => {
      const $el = $(el)
    
      const $link = $el.find('a')
      const href = $link.attr('href')
      const isnew = !!$el.find('.title_new').text()
      
      return {
        id: +href.match(/\d+/g)[0],
        name: tify($link.text()),
        wd: parseInt(id) || 7,
        isnew,
        mttime: undefined,
        namefornew: tify($el.find('.title_sub').text())
      }
    }).get()

    animeList = animeList.concat(tempList)
  })

  return animeList
}

export const getAnimeUpdate = async (): Promise<{
  id: string;
  link: string;
  name: string;
  imgUrl: string;
  description: string;
}[]> => {
  // 取得最近更新的列表
  const { data: htmlString } = await axiosInstance.get(`${BASE_URL}/update`)

  const $ = cheerio.load(htmlString);

  const items = $('.video_item').map((_, li) => {
    const $li = $(li);
    const $link = $li.find('a')
    const href = $link.attr('href')

    return {
      id: +href.match(/\d+/g)[0],
      link: href,
      name: tify($link.text()),
      imgUrl: $li.find('img').attr('src') || '',
      description: tify($li.find('.video_item--info')?.text()?.trim())
    }
  }).get();

  return items;
}

export const getAnimeDetails = async (id: string) => {
  const { data: htmlString } = await axiosInstance.get(`${BASE_URL}/detail/${id}`)

  const $ = cheerio.load(htmlString);

  const $img = $('img.poster');

  const animeObj = {
    area: '',
    type: '',
    originName: '',
    studio: '',
    dateAired: '',
    status: '',
    tags: [],
    officialWebsite: '',
  };
  $('.detail_imform_kv').each((i, kv) => {
    const tag = $(kv).find('span:nth-child(1)').text()
    const value = $(kv).find('span:nth-child(2)').text()
    switch (tag) {
      case '地区：':
        animeObj.area = tify(value);
        break;
      case '动画种类：':
        animeObj.type = tify(value);
        break;
      case '原版名称：':
        animeObj.originName = value;
        break;
      case '制作公司：':
        animeObj.studio = value;
        break;
      case '首播时间：':
        animeObj.dateAired = value;
        break;
      case '播放状态：':
        animeObj.status = tify(value);
        break;
      case '标签：':
        animeObj.tags = value.split(' ').map(text => tify(text));
        break;
      case '官方网站：':
        animeObj.officialWebsite = value;
        break;
    }
  })
  // https://apd-vliveachy.apdcdn.tc.qq.com/vmtt.tc.qq.com/1098_7d490da8190677a7ac4584160c4f8c09.f0.mp4?vkey=87C66692CC6BD228350E34FA8C334CC490B04E87F33679AA070DBDC20CD758B80364E351A46773CD35770D1A46C8D83B68C33EDE0A72317AE0084BA1F87771E3F61B952C3F85CD13F1924C3E932E1CF005E0F59581B9A0EA

  let episodeList: EpisodeVM[];
  $('.movurl').each((i, movurl) => {
    const $movurl = $(movurl);
    if ($movurl.css('display') !== 'none') {
      episodeList = $movurl.find('li').map((i, li) => {
        const $li = $(li);
        const href = $li.find('a').attr('href');
        const playid = href.match(/(playid=)+([\w-]*)?/)?.[0]?.replace('playid=', '');

        return {
          id: playid,
          pId: playid.split('_')[0],
          eId: playid.split('_')[1],
          href: `${BASE_URL}${href}`,
          title: tify($li.text().trim())
        } as EpisodeVM;
      }).get();
    }
  })

  const desc = $('.detail_imform_desc_pre p')?.html() ?? '';
  return {
    id,
    title: tify($img.attr('alt')),
    imgUrl: `https://${$img.attr('src')}`,
    description: tify(decode(desc)),
    ...animeObj,
    episodeList,
  };
}

export const getAnimeVideo = async (id: string, pId: string, eId: string): Promise<string> => {
  const { status, data, headers } = await axiosInstance.get(`${BASE_URL}/_getplay?aid=${id}&playindex=${pId}&epindex=${eId}&r=${Math.random()}`, {
    headers: {
      referer: `${BASE_URL}/play/${id}?playid=${pId}_${eId}`
    },
    maxRedirects: 0
  }) 

  return data?.vurl || `${BASE_URL}/play/${id}?playid=${pId}_${eId}`
}

export const queryAnimeList = async (keyword: string, page = 1) => {
  const { data: htmlString } = await axiosInstance.get(`${BASE_URL}/search`, {
    params: {
      query: decodeURIComponent(keyword),
      page,
    }
  })

  const $ = cheerio.load(htmlString);

  const list = $('.blockcontent1 .cell').map((i, cell) => {
    const $cell = $(cell);
    let type: string, originName: string, studio: string, dateAired: string, status: string, tags: string[], description: string;
    $cell.find('.cell_imform_kv').each((i, kv) => {
      const tag = $(kv).find('span:nth-child(1)').text()
      const value = $(kv).find('span:nth-child(2)').text()
      switch (tag) {
        case '动画种类：':
          type = tify(value);
          break;
        case '原版名称：':
          originName = value;
          break;
        case '制作公司：':
          studio = value;
          break;
        case '首播时间：':
          dateAired = value;
          break;
        case '播放状态：':
          status = tify(value);
          break;
        case '剧情类型：':
          tags = value.split(' ').map(text => tify(text));
          break;
        case '简介：':
          description = tify($(kv).find('.cell_imform_desc').text().trim());
          break;
      }
    })

    return {
      id: $cell.find('.cell_imform_name').attr('href')?.replace('detail', '')?.replace(/\//g, ''),
      title: tify($cell.find('.cell_imform_name').text()),
      imgUrl: `https://${$cell.find('img').attr('src')}`,
      type,
      originName,
      studio,
      dateAired,
      status,
      tags,
      description
    }
  }).get();

  return list;
}