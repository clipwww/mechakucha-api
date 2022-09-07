import  cheerio from 'cheerio';
import  moment from 'moment';
import { groupBy as _groupBy } from 'lodash';
import path from 'path';

import { axiosInstance, lruCache, puppeteerUtil } from '../utilities'

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
 
  const { data: htmlString } = await axiosInstance.get(`${BASE_URL}/movie/now`);

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
  const { data: htmlString } = await axiosInstance.get(`${BASE_URL}/movie/${type}/0/`);

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
  const { data: htmlString } = await axiosInstance.get(`${BASE_URL}/home/quickSelect.html`);

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
          id: $(el).val(),
          name: $(el).text().trim(),
        })
      }
    });

    return citys;
}

export async function getTheaterList(cityId: string): Promise<{ id: string, name: string }[]> {

  const { data: htmlString } = await axiosInstance.get(`${BASE_URL}/showtime/${cityId}`);

    const $ = cheerio.load(htmlString);

    return $(`#theaterList a[href*="/showtime/"]`).map((_i, el) => {
      return {
        id: ($(el).attr('href') || '').split('/')[2],
        name: $(el).text().trim(),
      };
    }).get(); 
}

export async function getMovieTimes(movieId: string, cityId?: string): Promise<{ item: MovieInfo, items: Theater[] }> {
  const { data: htmlString } = await axiosInstance.get(`${BASE_URL}/movie/${movieId}`);

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
          id: ($option.attr('value') || '').split('/')[3],
          name: $option.text().trim()
        }
      }).get().filter((item) => item.id),
  };
  let items = [];

  if (cityId) {
    const { data: htmlString } = await axiosInstance.get(`${BASE_URL}/showtime/${movieId}/${cityId}/`);
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
      const versionObj = {};
      tempObject[key].forEach((obj: { versionName: string, time: string[] }) => {
        const name = obj.versionName || '一般';
        if (versionObj[name]) {
          versionObj[name] = [...versionObj[name], ...obj.time];
        } else {
          versionObj[name] = [...obj.time];
        }
      });

      return {
        id: key,
        name: tempObject[key][0].theaterName,
        versions: Object.keys(versionObj).map(vKey => {
          return {
            name: vKey,
            times: versionObj[vKey]
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
  const { data: htmlString } = await axiosInstance.get(`${BASE_URL}/showtime/${theaterId}/${cityId}/${dateString}`);

  const $ = cheerio.load(htmlString);

  let ldJson: any = lruCache.get(`theater-info-${theaterId}`);
  if (!ldJson) {
    if (isToday) {
      ldJson = JSON.parse($('[type=\'application/ld+json\']').html() || '{}');
    } else {
      const { data: hs } = await axiosInstance.get(`${BASE_URL}/showtime/${theaterId}/${cityId}/`);
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
      id: ($title.attr('href') || '//').split('/')[2],
      title: $title.text(),
      image: $el.find('img[width]').attr('src'),
      runtime: +$info.text().replace(/片長：|分/g, '').trim(),
      cerImg: `${BASE_URL}/${$info.find('li:nth-child(2) img').attr('src')}`,
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
  const { data: ret } = await axiosInstance.get<{ data: { items: {
    movieId: number
    years: string
    certificateNumber: string
    name: string
    length: string
    rating: string
  }[] } }>(`https://cinema.bamid.gov.tw/Search/RetrieveResult`, {
    params: {
      name: keyword,
      searchType,
    }
  });
 
  const items = ret.data.items.map(item => {
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
  const { data: ret } = await axiosInstance.get<{ data: {
    certificateDate: string
    certificateNumber: string
    certificatePeriodEnd: string
    certificatePeriodStart: string
    certificateType: string
    distributor: string
    format: string
    lang: string
    length: string
    name: string
    originalName: string
    presentType: string
    publishReviewComment: boolean
    rating: string
reviewComment: ""
  } }>(`https://cinema.bamid.gov.tw/Search/RetrieveDetail`, {
    params: {
      certificateNumber
    }
  });

  return ret.data;
}

export async function getVieShowComingMovieList(p = 1): Promise<{
  id: string
  title: string
  titleEN: string
  imgSrc: string
  url: string
  time: string
  theaterMark: string
}[]> {
  const baseURL = `https://www.vscinemas.com.tw/vsweb/film`
  const { data: htmlString } = await axiosInstance.get(`${baseURL}/coming.aspx`, {
    params: {
      p
    }
  });

  const $ = cheerio.load(htmlString);
  const $liList = $('.movieList li')

  if (!$liList.length) {
    return []
  }

  const list =  $liList.map((i, el) => {
    const $li = $(el);
    
    const id = $li.find('a').attr('href').replace('detail.aspx?id=', '');
    const title = $li.find('h2').text()
    const titleEN = $li.find('h3').text()
    const url = $li.find('a').attr('href')
    const imgSrc = $li.find('img').attr('src')
    const time = $li.find('time').text()
    const theaterMark = $li.find('.theaterMark').text()

    return {
      id,
      title,
      titleEN,
      url: path.join(baseURL, url),
      imgSrc: path.join(baseURL, imgSrc),
      time,
      theaterMark
    };
  }).get();


  return list.concat(await getVieShowComingMovieList(p + 1))
}