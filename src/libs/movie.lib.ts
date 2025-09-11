import  cheerio from 'cheerio';
import  moment from 'moment';
import { groupBy as _groupBy } from 'lodash';
import path from 'path';

import { httpClient, lruCache } from '../utilities'

const BASE_URL = 'http://www.atmovies.com.tw';

interface MovieSimpleInfo {
  id: string;
  name: string;
  description: string;
  cerImg: string;
}

interface MovieInfo {
  id: string;
  name: string;
  description: string;
  runtime: number;
  poster: string;
  trailer: string;
  currentDate: string;
  releaseDate: string;
  cerImg: string;
  citys: Array<{ id: string, name: string }>
}

interface Theater {
  id: string;
  name: string;
  versions: {
    name: string;
    times: string[];
  }[];
}

interface TheaterMovie {
  id: string;
  title: string;
  image: string;
  runtime: string;
  cerImg: string;
  versions: Array<{
    name: string;
    times: string[];
  }>;
}

export async function getMovieList() {
 
  const { body: htmlString } = await httpClient.get(`${BASE_URL}/movie/now`);

  const $ = cheerio.load(htmlString);

  return $('.filmListPA li').map((i, el) => {
    const $li = $(el);
    const $a = $li.find('a');
    const $runtime = $li.find('.runtime');

    const valueArr = ($a.attr('href') || '/').split('/')
    return {
      id: valueArr[2],
      name: $a.text(),
      description: $runtime.text(),
      cerImg: `${BASE_URL}/${$runtime.find('img').attr('src')}`
    };
  }).get() as MovieSimpleInfo[];
}

export async function getMovieListGroupByDate(type: 'now' | 'next' = 'now') {
  const { body: htmlString } = await httpClient.get(`${BASE_URL}/movie/${type}/0/`);

    const $ = cheerio.load(htmlString);
    const $majorList = $('.major');


   return  $majorList.map((i, mel) => {
      const $filmList = $(`.filmListAll:nth-of-type(${i + 1})`);
      const $li = $filmList.find('li');

      return {
        releaseDate: $(mel).text(),
        movies: $li.map((i, fel) => {
          const $fel = $(fel);
          return {
            id: ($fel.find('a').attr('href') || '/').split('/')[2],
            poster: $fel.find('.filmListAllPoster').attr('src'),
            name: $fel.find('.filmtitle a').text(),
          }
        }).get()
      };
    }).get();
}

export async function getCityList(): Promise<{ id: string, name: string }[]> {
  const { body: htmlString } = await httpClient.get(`${BASE_URL}/home/quickSelect.html`);

    const $ = cheerio.load(htmlString);

    const citys: Array<{ id: string, name: string }> = [];
    $('select[name=area] option')
    .filter((i, el) => {
      return !!$(el).val();
    })
    .each((i, el) => {
      const id = $(el).val();
      if (!citys.find(c => c.id === id)) {
        citys.push({
          id: $(el).val() as string,
          name: $(el).text().trim(),
        })
      }
    });

    return citys;
}

export async function getTheaterList(cityId: string): Promise<{ id: string, name: string }[]> {

  const { body: htmlString } = await httpClient.get(`${BASE_URL}/showtime/${cityId}`);

    const $ = cheerio.load(htmlString);

    return $(`#theaterList a[href*="/showtime/"]`).map((_i, el) => {
      return {
        id: ($(el).attr('href') || '').split('/')[2] || '',
        name: $(el).text().trim(),
      };
    }).get(); 
}

export async function getMovieTimes(movieId: string, cityId?: string): Promise<{ item: MovieInfo, items: Theater[] }> {
  const { body: htmlString } = await httpClient.get(`${BASE_URL}/movie/${movieId}`);

  const $ = cheerio.load(htmlString);

  const $movieInfoLi = $('.runtime');
  const $theaterSelectOptions = $('[name="FORMS"] option')

  const item = {
    id: movieId,
    name: $('.filmTitle').text().trim(),
    runtime: +($movieInfoLi.find('li:nth-child(1)').text() || '').replace(/片長：|分/g, '').trim(),
    poster: $(".Poster img").attr('src') || '',
    trailer: $('iframe.featured').attr('src') || '',
    description: $('meta[property="og:description"]').attr('content') || '',
    currentDate: moment().format('YYYY/MM/DD'),
    releaseDate: ($movieInfoLi.find('li:nth-child(2)').text() || '').replace(/上映日期：/g, '').trim(),
    cerImg:`${BASE_URL}/${$('.filmTitle img').attr('src')}`,
    citys: $theaterSelectOptions
      .map((i, el) => {
        const $option = $(el)
        return {
          id: ($option.attr('value') || '').split('/')[3] || '',
          name: $option.text().trim()
        }
      }).get().filter((item) => item.id),
  };
  let items: Theater[] = [];

  if (cityId) {
    const { body: htmlString } = await httpClient.get(`${BASE_URL}/showtime/${movieId}/${cityId}/`);
    const $ = cheerio.load(htmlString);
    const tempArr = $('#filmShowtimeBlock > ul').map((i, el) => {
      const $theater = $(el).find('.theaterTitle');

      return {
        theaterId: ($theater.find('a').attr('href') || '').split('/')[2],
        theaterName: $theater.text(),
        versionName: $(el).find('.filmVersion').text().trim(),
        time: $(el).find('li').filter((_i, el) => $(el).text().includes('：')).map((i, el) => $(el).text()).get(),
      };
    }).get();

    const tempObject = _groupBy(tempArr, 'theaterId');

    items = Object.keys(tempObject).map<Theater>(key => {
      const versionObj: Record<string, string[]> = {};
      (tempObject[key] || []).forEach((obj: { versionName: string, time: string[] }) => {
        const name = obj.versionName || '一般';
        if (versionObj[name]) {
          versionObj[name] = [...versionObj[name], ...obj.time];
        } else {
          versionObj[name] = [...obj.time];
        }
      });

      return {
        id: key,
        name: (tempObject[key] || [])[0]?.theaterName || '',
        versions: Object.keys(versionObj).map(vKey => {
          return {
            name: vKey,
            times: versionObj[vKey] || []
          };
        })
      };
    });
  };

  return {
    item,
    items,
  }
}

export async function getTheaterTimes(theaterId: string, cityId: string, date: string): Promise<{ item: any, items: TheaterMovie[] }> {
  const isToday = moment(date).isSame(moment(), 'day');

  const dateString = isToday ? '' : moment(date).format('YYYYMMDD');
  const { body: htmlString } = await httpClient.get(`${BASE_URL}/showtime/${theaterId}/${cityId}/${dateString}`);

  const $ = cheerio.load(htmlString);

  let ldJson: any = lruCache.get(`theater-info-${theaterId}`);
  if (!ldJson) {
    if (isToday) {
      ldJson = JSON.parse($('[type=\'application/ld+json\']').html() || '{}');
    } else {
      const { body: hs } = await httpClient.get(`${BASE_URL}/showtime/${theaterId}/${cityId}/`);
      ldJson = JSON.parse($(hs).find('[type=\'application/ld+json\']').html() || '{}');
    }

    if (ldJson && ldJson.name) {
      lruCache.set(`theater-info-${theaterId}`, ldJson, 1000 * 60 * 60 * 24 * 7);
    }
  }

  const item = {
    id: theaterId,
    name: ldJson.name || '',
    url: ldJson.url || '',
    address: ldJson.address || '',
    geo: ldJson.geo,
    telephone: ldJson.telephone || '',
    openingHours: ldJson.openingHours || '',
  };

  const $movieList = $('#theaterShowtimeBlock ul[id]');

  const movies: TheaterMovie[] = $movieList.map((_i, el) => {
    const $el = $(el);
    const $title = $el.find('.filmTitle a');
    const $version = $el.find('ul:nth-child(2)');
    const $info = $el.find('ul:nth-child(1)');

    return {
      id: ($title.attr('href') || '//').split('/')[2] || '',
      title: $title.text(),
      image: $el.find('img[width]').attr('src') || '',
      runtime: $info.text().replace(/片長：|分/g, '').trim(),
      cerImg: `${BASE_URL}/${$info.find('li:nth-child(2) img').attr('src') || ''}`,
      versions: $version.map((i, vel) => {
        const $vel = $(vel);

        return {
          name: $vel.find('.filmVersion').text(),
          times: $vel.find('li:not(.filmVersion, .theaterElse)')
            .map((i, tel) => $(tel).text().replace('☆訂票', '').trim()).get()
        }
      }).get()
    }
  }).get();

  const newMovies: TheaterMovie[] = [];
  movies.forEach(item => {
    const movie = newMovies.find(o => o.id === item.id);
    if (!!movie) {
      movie.versions = [
        ...movie.versions,
        ...item.versions,
      ]
    } else {
      newMovies.push(item);
    }
  })

  return {
    item,
    items: newMovies,
  };
}

export const searchMovieRating = async (keyword: string, searchType = 'All') => {
  const { body: ret } = await httpClient.get(`https://cinema.bamid.gov.tw/Search/RetrieveResult`, {
    searchParams: {
      name: keyword,
      searchType,
    }
  });
  const data = JSON.parse(ret);
  const items = data.data.items.map((item: any) => {
    return {
      ...item,
      id: item.movieId,
      no: `${item.movieId}`,
      officialDoc: item.certificateNumber,
      year: item.years,
      title: item.name,
      runtime: item.length,
      country: ''
    }
  })

  return items;
}

export const searchMovieRatingDetails = async (certificateNumber: string) => {
  const { body: ret } = await httpClient.get(`https://cinema.bamid.gov.tw/Search/RetrieveDetail`, {
    searchParams: {
      certificateNumber
    }
  });
  const data = JSON.parse(ret);
  return data.data;
}

export async function getVieShowNowMovieList(p = 1, maxPage = 0): Promise<{
  id: string
  title: string
  titleEN: string
  imgSrc: string
  url: string
  time: string
  theaterMarks: string[]
}[]> {
  if (maxPage > 0 && p > maxPage) {
    return []
  }

  const baseURL = `https://www.vscinemas.com.tw/vsweb/film`
  const { body: htmlString } = await httpClient.get(baseURL, {
    searchParams: {
      p
    }
  });

  const $ = cheerio.load(htmlString);
  const $liList = $('.movieList li')
  maxPage = Math.max(...$('.pagebar li').map((_, el) => +$(el).text()).get())

  if (!$liList.length) {
    return []
  }

  const list =  $liList.map((i, el) => {
    const $li = $(el);
    
    const href = $li.find('a').attr('href');
    const id = href ? href.replace('detail.aspx?id=', '') : '';
    const title = $li.find('h2').text()
    const titleEN = $li.find('h3').text()
    const url = $li.find('a').attr('href')
    const imgSrc = $li.find('img').attr('src')
    const time = $li.find('time').text()
    const theaterMarks = $li.find('.theaterMark').map((_, el) => $(el).text()).get()

    return {
      id,
      title,
      titleEN,
      url: url ? path.join(baseURL, url) : '',
      imgSrc: imgSrc ? path.join(baseURL, imgSrc) : '',
      time,
      theaterMarks
    };
  }).get();

  return list.concat(await getVieShowNowMovieList(p + 1, maxPage))
}

export async function getVieShowComingMovieList(p = 1, maxPage = 0): Promise<{
  id: string
  title: string
  titleEN: string
  imgSrc: string
  url: string
  time: string
  theaterMarks: string[]
}[]> {
  if (maxPage > 0 && p > maxPage) {
    return []
  }

  const baseURL = `https://www.vscinemas.com.tw/vsweb/film`
  const { body: htmlString } = await httpClient.get(`${baseURL}/coming.aspx`, {
    searchParams: {
      p
    }
  });

  const $ = cheerio.load(htmlString);
  const $liList = $('.movieList li')
  maxPage = Math.max(...$('.pagebar li').map((_, el) => +$(el).text()).get())

  if (!$liList.length) {
    return []
  }

  const list = $liList.map((i, el) => {
    const $li = $(el);
    
    const href = $li.find('a').attr('href');
    const id = href ? href.replace('detail.aspx?id=', '') : '';
    const title = $li.find('h2').text()
    const titleEN = $li.find('h3').text()
    const url = $li.find('a').attr('href')
    const imgSrc = $li.find('img').attr('src')
    const time = $li.find('time').text()
    const theaterMarks = $li.find('.theaterMark').map((_, el) => $(el).text()).get()

    return {
      id,
      title,
      titleEN,
      url: url ? path.join(baseURL, url) : '',
      imgSrc: imgSrc ? path.join(baseURL, imgSrc) : '',
      time,
      theaterMarks
    };
  }).get();

  return list.concat(await getVieShowComingMovieList(p + 1, maxPage))
}

const CinemaCodeMapping: Record<string, string> = {
  TP: "台北信義威秀影城",
  MU: "MUVIE CINEMAS 台北松仁",
  MUC: "MUVIE CINEMAS 台北松仁 (MUCROWN)",
  QS: "台北京站威秀影城",
  TX: "台北西門威秀影城",
  BQ: "板橋大遠百威秀影城",
  GM: "中和環球威秀影城",
  HU: "新店裕隆城威秀影城",
  LK: "林口MITSUI OUTLET PARK威秀影城",
  LKMP: "林口MITSUI OUTLET PARK威秀影城 (Mappa)",
  TY: "桃園統領威秀影城",
  TG: "桃園桃知道威秀影城",
  HS: "新竹大遠百威秀影城",
  HSGC: "新竹大遠百威秀影城 (GC)",
  BC: "新竹巨城威秀影城",
  TF: "頭份尚順威秀影城",
  TZ: "台中大遠百威秀影城",
  TT01: "MUVIE CINEMAS 台中TIGER CITY",
  TT02: "MUVIE CINEMAS 台中TIGER CITY (GC)",
  MM: "台中大魯閣新時代威秀影城",
  TN: "台南大遠百威秀影城",
  FC: "台南FOCUS威秀影城",
  NF: "台南南紡威秀影城",
  NFGC: "台南南紡威秀影城 (GC)",
  KS: "高雄大遠百威秀影城",
  KSGC: "高雄大遠百威秀影城 (GC)",
  HL: "花蓮新天堂樂園威秀影城"
}

export async function getVieShowMovieShowTimes(cinemaCode: string): Promise<{
  id: string
  cinema: string
  name: string
  nameEN: string
  showTimes: {
    date: string
    times: string[]
  }[]
}[]> {
  cinemaCode = cinemaCode.toUpperCase()

  if (!CinemaCodeMapping[cinemaCode]) {
    return []
  }

  const baseURL = `https://www.vscinemas.com.tw/ShowTimes/ShowTimes/GetShowTimes`
  const { body: htmlString } = await httpClient.post(baseURL, {
    json: {
      CinemaCode: cinemaCode,
    }
  });


  const $ = cheerio.load(`<div id="wrap">${htmlString}</div>`);
  const $liList = $('#wrap > .col-xs-12')

  if (!$liList.length) {
    return []
  }

  const list = $liList.map((i, el) => {
    const $li = $(el);
    
    const name = $li.find('.LangTW.MovieName').text().trim()
    const nameEN = $li.find('.LangEN.MovieName').text().trim()
    const id = btoa(nameEN)
    const dates = $li.find('.LangEN.RealShowDate').map((_, el) => $(el).text().trim()).toArray()
    const times = $li.find('.SessionTimeInfo').map((_, el) => {
      return [$(el).find('div').map((_, el2) => $(el2).text().trim()).toArray()]
    }).get()

    return {
      id,
      cinema: CinemaCodeMapping[cinemaCode] || '',
      name,
      nameEN,
      showTimes: times.map((arr, idx) => {
        return {
          date: dates[idx] || '',
          times: arr
        }
      })
    };
  }).get();

  return list
}