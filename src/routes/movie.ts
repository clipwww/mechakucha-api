import { OpenAPIHono } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import { z } from 'zod';

import { lruCache } from '../utilities/lru-cache';
import { searchMovieRating, getCityList, getMovieList, getMovieListGroupByDate, getTheaterList, getMovieTimes, getTheaterTimes, searchMovieRatingDetails, getVieShowComingMovieList, getVieShowNowMovieList, getVieShowMovieShowTimes } from '../libs/movie.lib';
import { ResultCode, ResultGenericVM, ResultListGenericVM } from '../view-models/result.vm';
import { MovieRatingModel } from '../nosql/models/movie.model'
import { sendNotifyMessage } from '../libs/line.lib';

// Zod Schemas for OpenAPI
const MovieRatingQuerySchema = z.object({
  keyword: z.string().optional().openapi({
    description: '搜尋關鍵字',
    example: '戰車'
  }),
});

const MovieRatingDetailParamSchema = z.object({
  certificateNumber: z.string().min(1).openapi({
    description: '分級證字號',
    example: '108528'
  }),
});

const TheaterQuerySchema = z.object({
  cityId: z.string().optional().openapi({
    description: '城市 ID',
    example: '1'
  }),
});

const MovieTimesParamSchema = z.object({
  movieId: z.string().min(1).openapi({
    description: '電影 ID',
    example: '12345'
  }),
});

const TheaterTimesParamSchema = z.object({
  theaterId: z.string().min(1).openapi({
    description: '影院 ID',
    example: '67890'
  }),
});

const VieShowQuerySchema = z.object({
  'cinema-code': z.string().optional().openapi({
    description: '戲院代碼',
    example: 'TP'
  }),
});

// Response Schemas
const MovieRatingSchema = z.object({
  id: z.string().openapi({ example: '108528' }),
  no: z.string().openapi({ example: '108528' }),
  officialDoc: z.string().openapi({ example: '局影外字第108528號' }),
  year: z.string().openapi({ example: '108' }),
  title: z.string().openapi({ example: '《少女與戰車 總集篇4DX》-第63屆戰車道全國高中生大會' }),
  country: z.string().openapi({ example: '日本' }),
  runtime: z.string().openapi({ example: '2時2分1秒' }),
  rating: z.string().openapi({ example: '普遍級' }),
}).openapi('MovieRating');

const CitySchema = z.object({
  id: z.string().openapi({ example: '1' }),
  name: z.string().openapi({ example: '台北市' }),
}).openapi('City');

const MovieSchema = z.object({
  id: z.string().openapi({ example: '12345' }),
  title: z.string().openapi({ example: '蜘蛛人：無家日' }),
  poster: z.string().optional().openapi({ example: 'https://example.com/poster.jpg' }),
  releaseDate: z.string().openapi({ example: '2021-12-15' }),
}).openapi('Movie');

const TheaterSchema = z.object({
  id: z.string().openapi({ example: '67890' }),
  name: z.string().openapi({ example: '信義威秀' }),
  address: z.string().openapi({ example: '台北市信義區松壽路20號' }),
}).openapi('Theater');

const ApiResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  resultCode: z.string().openapi({ example: '200' }),
  resultMessage: z.string().openapi({ example: '' }),
  items: z.array(z.any()).optional(),
  item: z.any().optional(),
}).openapi('ApiResponse');

const app = new OpenAPIHono();

// 定義路由
const ratingRoute = createRoute({
  method: 'get',
  path: '/rating',
  summary: '搜尋電影分級資訊',
  description: '根據關鍵字搜尋電影分級證字號資訊',
  tags: ['影視娛樂'],
  request: {
    query: MovieRatingQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ApiResponseSchema,
        },
      },
      description: '成功取得分級資訊',
    },
  },
});

const ratingDetailRoute = createRoute({
  method: 'get',
  path: '/rating/:certificateNumber',
  summary: '取得電影分級詳細資訊',
  description: '根據分級證字號取得詳細的分級資訊',
  tags: ['影視娛樂'],
  request: {
    params: MovieRatingDetailParamSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ApiResponseSchema,
        },
      },
      description: '成功取得詳細分級資訊',
    },
  },
});

const cityRoute = createRoute({
  method: 'get',
  path: '/city',
  summary: '取得城市列表',
  description: '取得所有可用的城市列表',
  tags: ['影視娛樂'],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ApiResponseSchema,
        },
      },
      description: '成功取得城市列表',
    },
  },
});

const movieListRoute = createRoute({
  method: 'get',
  path: '/list',
  summary: '取得電影列表',
  description: '取得所有上映中的電影列表',
  tags: ['影視娛樂'],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ApiResponseSchema,
        },
      },
      description: '成功取得電影列表',
    },
  },
});

const movieListGroupRoute = createRoute({
  method: 'get',
  path: '/list-group-by-date',
  summary: '按日期分組取得電影列表',
  description: '取得按上映日期分組的電影列表',
  tags: ['影視娛樂'],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ApiResponseSchema,
        },
      },
      description: '成功取得分組電影列表',
    },
  },
});

const nextMovieRoute = createRoute({
  method: 'get',
  path: '/next',
  summary: '取得即將上映電影',
  description: '取得即將上映的電影列表',
  tags: ['影視娛樂'],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ApiResponseSchema,
        },
      },
      description: '成功取得即將上映電影',
    },
  },
});

const theaterRoute = createRoute({
  method: 'get',
  path: '/theater',
  summary: '取得影院列表',
  description: '根據城市取得影院列表',
  tags: ['影視娛樂'],
  request: {
    query: TheaterQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ApiResponseSchema,
        },
      },
      description: '成功取得影院列表',
    },
  },
});

const movieTimesRoute = createRoute({
  method: 'get',
  path: '/times/:movieId',
  summary: '取得電影場次',
  description: '取得指定電影的場次資訊',
  tags: ['影視娛樂'],
  request: {
    params: MovieTimesParamSchema,
    query: TheaterQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ApiResponseSchema,
        },
      },
      description: '成功取得電影場次',
    },
  },
});

const theaterTimesRoute = createRoute({
  method: 'get',
  path: '/theater/:theaterId',
  summary: '取得影院場次',
  description: '取得指定影院的場次資訊',
  tags: ['影視娛樂'],
  request: {
    params: TheaterTimesParamSchema,
    query: z.object({
      date: z.string().optional().openapi({
        description: '查詢日期',
        example: '2024-01-15'
      }),
      cityId: z.string().optional().openapi({
        description: '城市 ID',
        example: '1'
      }),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ApiResponseSchema,
        },
      },
      description: '成功取得影院場次',
    },
  },
});

const vieshowNowRoute = createRoute({
  method: 'get',
  path: '/vieshow/now',
  summary: '取得威秀現正熱映',
  description: '取得威秀影城現正熱映的電影',
  tags: ['影視娛樂'],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ApiResponseSchema,
        },
      },
      description: '成功取得現正熱映電影',
    },
  },
});

const vieshowComingRoute = createRoute({
  method: 'get',
  path: '/vieshow/coming',
  summary: '取得威秀即將上映',
  description: '取得威秀影城即將上映的電影',
  tags: ['影視娛樂'],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ApiResponseSchema,
        },
      },
      description: '成功取得即將上映電影',
    },
  },
});

const vieshowShowTimesRoute = createRoute({
  method: 'get',
  path: '/vieshow/show-times',
  summary: '取得威秀場次資訊',
  description: '取得指定威秀戲院的場次資訊',
  tags: ['影視娛樂'],
  request: {
    query: VieShowQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ApiResponseSchema,
        },
      },
      description: '成功取得場次資訊',
    },
  },
});

// 註冊路由
app.openapi(ratingRoute, async (c) => {
  try {
    let { keyword } = c.req.query();
    keyword = keyword ? `${keyword}` : ''

    const result = new ResultListGenericVM();

    const items = await searchMovieRating(keyword);
    result.items = items;
    result.setResultValue(true, ResultCode.success);

    const key = `movie-rating-${keyword}`;
    const cacheValue =  lruCache.get(key) as any[];
    if (cacheValue?.[0]?.no !== items?.[0]?.no && keyword.includes('戰車')) {
      items.forEach(async (item: any) => {
        const movieDoc = await MovieRatingModel.findOne({ no: item.no })
        if (!movieDoc) {
          const { id, ...other } = item;
          await MovieRatingModel.create(other);
          sendNotifyMessage({
            message: `
--- 電影分級查詢結果: "${keyword}" ---
找到一筆新的資料: ${item.title}
            `
          })
        }
      })
      lruCache.set(key, items, 1000 * 60 * 60 * 24 * 30)
    }

    return c.json(result);
  } catch (err) {
    throw err;
  }
});

app.openapi(ratingDetailRoute, async (c) => {
  try {
    let { certificateNumber } = c.req.param();
    if (!certificateNumber) {
      throw Error('parameters is empty')
    }
    const key = `movie-rating-details-${certificateNumber}`;

    const result = new ResultGenericVM();
    const cacheValue =  lruCache.get(key)

    if (cacheValue) {
      result.item = cacheValue
    } else {
      result.item = await searchMovieRatingDetails(certificateNumber); 
    }

    result.setResultValue(true, ResultCode.success);

    lruCache.set(key, result.item, 1000 * 60 * 60 * 24 * 30)
    
    return c.json(result);
  } catch (err) {
    throw err;
  }
});

app.openapi(cityRoute, async (c) => {
  try {
    const result = new ResultListGenericVM();
    result.items = await getCityList();

    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    throw err;
  }
});

app.openapi(movieListRoute, async (c) => {
  try {
    const result = new ResultListGenericVM();
    result.items = await getMovieList();

    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    throw err;
  }
});

app.openapi(movieListGroupRoute, async (c) => {
  try {
    const result = new ResultListGenericVM();
    result.items = await getMovieListGroupByDate();

    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    throw err;
  }
});

app.openapi(nextMovieRoute, async (c) => {
  try {
    const result = new ResultListGenericVM();
    result.items = await getMovieListGroupByDate('next');

    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    throw err;
  }
});

app.openapi(theaterRoute, async (c) => {
  try {
    const { cityId } = c.req.query();
    const result = new ResultListGenericVM();
    result.items = await getTheaterList(cityId as string);

    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    throw err;
  }
});

app.openapi(movieTimesRoute, async (c) => {
  try {
    const { movieId } = c.req.param()
    const { cityId } = c.req.query();
    const result = new ResultListGenericVM();
    const { item, items } = await getMovieTimes(movieId, cityId as string);

    result.item = item;
    result.items = items;

    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    throw err;
  }
});

app.openapi(theaterTimesRoute, async (c) => {
  try {
    const { theaterId } = c.req.param();
    const { date, cityId } = c.req.query();
    const result = new ResultListGenericVM();
    const { item, items } = await getTheaterTimes(theaterId, cityId as string, date as string);

    result.item = item;
    result.items = items;

    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    throw err;
  }
});

app.openapi(vieshowNowRoute, async (c) => {
  try {
    const result = new ResultListGenericVM();
    
    const key = `movie-vieshow-now`;

    const cacheValue =  lruCache.get(key) as any[]

    if (cacheValue) {
      result.items = cacheValue
    } else {
      const movieList = await getVieShowNowMovieList();
      result.items = movieList;

      lruCache.set(key, movieList, 1000 * 60 * 60 * 2)
    }
    
    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    throw err;
  }
});

app.openapi(vieshowComingRoute, async (c) => {
  try {
    const result = new ResultListGenericVM();
    
    const key = `movie-vieshow-coming`;

    const cacheValue =  lruCache.get(key) as any[]

    if (cacheValue) {
      result.items = cacheValue
    } else {
      const movieList = await getVieShowComingMovieList();
      result.items = movieList;

      lruCache.set(key, movieList, 1000 * 60 * 60 * 2)
    }
    
    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    throw err;
  }
});

app.openapi(vieshowShowTimesRoute, async (c) => {
  try {
    const { 'cinema-code': cinemaCode } = c.req.query()
    const result = new ResultListGenericVM();

    if (!cinemaCode) {
      throw new Error('cinema-code is empty.')
    }
    
    const key = `movie-vieshow-show-times-${cinemaCode}`;

    const cacheValue =  lruCache.get(key) as any[]

    if (cacheValue) {
      result.items = cacheValue
    } else {
      const movieList = await getVieShowMovieShowTimes(cinemaCode as string);
      result.items = movieList;

      lruCache.set(key, movieList, 1000 * 60 * 5)
    }
    
    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    throw err;
  }
});

export default app;