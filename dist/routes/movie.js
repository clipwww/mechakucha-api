import { OpenAPIHono } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import { lruCache } from '../utilities/lru-cache';
import { searchMovieRating, getCityList, getMovieList, getMovieListGroupByDate, getTheaterList, getMovieTimes, getTheaterTimes, searchMovieRatingDetails, getVieShowComingMovieList, getVieShowNowMovieList, getVieShowMovieShowTimes } from '../libs/movie.lib';
import { ResultCode, ResultGenericVM, ResultListGenericVM } from '../view-models/result.vm';
import { MovieRatingModel } from '../nosql/models/movie.model';
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
    id: z.string().openapi({
        description: '電影 ID',
        example: '108528'
    }),
    no: z.string().openapi({
        description: '電影編號',
        example: '108528'
    }),
    officialDoc: z.string().openapi({
        description: '官方文號',
        example: '局影外字第108528號'
    }),
    year: z.string().openapi({
        description: '製作年份',
        example: '108'
    }),
    title: z.string().openapi({
        description: '電影名稱',
        example: '《少女與戰車 總集篇4DX》-第63屆戰車道全國高中生大會'
    }),
    country: z.string().openapi({
        description: '製作國家',
        example: ''
    }),
    runtime: z.string().openapi({
        description: '片長',
        example: '2時2分1秒'
    }),
}).openapi('MovieRating');
// 電影分級詳細資訊 Schema
const MovieRatingDetailSchema = z.object({
    certificateNumber: z.string().openapi({
        description: '分級證字號',
        example: '108528'
    }),
    name: z.string().openapi({
        description: '電影名稱',
        example: '《少女與戰車 總集篇4DX》-第63屆戰車道全國高中生大會'
    }),
    years: z.string().openapi({
        description: '製作年份',
        example: '108'
    }),
    length: z.string().openapi({
        description: '片長',
        example: '2時2分1秒'
    }),
    certificate: z.string().openapi({
        description: '分級結果',
        example: '普遍級'
    }),
    reason: z.string().optional().openapi({
        description: '分級理由',
        example: '本片內容適合普遍觀眾觀賞'
    }),
}).openapi('MovieRatingDetail');
// 電影分級列表響應 Schema
const MovieRatingListResponseSchema = z.object({
    success: z.boolean().openapi({
        description: '是否成功',
        example: true
    }),
    resultCode: z.string().openapi({
        description: '結果代碼',
        example: '200'
    }),
    resultMessage: z.string().openapi({
        description: '結果訊息',
        example: ''
    }),
    items: z.array(MovieRatingSchema).openapi({
        description: '電影分級列表'
    }),
}).openapi('MovieRatingListResponse');
// 電影分級詳細響應 Schema
const MovieRatingDetailResponseSchema = z.object({
    success: z.boolean().openapi({
        description: '是否成功',
        example: true
    }),
    resultCode: z.string().openapi({
        description: '結果代碼',
        example: '200'
    }),
    resultMessage: z.string().openapi({
        description: '結果訊息',
        example: ''
    }),
    item: MovieRatingDetailSchema.openapi({
        description: '電影分級詳細資訊'
    }),
}).openapi('MovieRatingDetailResponse');
const CitySchema = z.object({
    id: z.string().openapi({
        description: '城市 ID',
        example: '1'
    }),
    name: z.string().openapi({
        description: '城市名稱',
        example: '台北市'
    }),
}).openapi('City');
// 城市列表響應 Schema
const CityListResponseSchema = z.object({
    success: z.boolean().openapi({
        description: '是否成功',
        example: true
    }),
    resultCode: z.string().openapi({
        description: '結果代碼',
        example: '200'
    }),
    resultMessage: z.string().openapi({
        description: '結果訊息',
        example: ''
    }),
    items: z.array(CitySchema).openapi({
        description: '城市列表'
    }),
}).openapi('CityListResponse');
const MovieSchema = z.object({
    id: z.string().openapi({
        description: '電影 ID',
        example: '12345'
    }),
    title: z.string().openapi({
        description: '電影名稱',
        example: '蜘蛛人：無家日'
    }),
    poster: z.string().optional().openapi({
        description: '海報圖片網址',
        example: 'https://example.com/poster.jpg'
    }),
    releaseDate: z.string().openapi({
        description: '上映日期',
        example: '2021-12-15'
    }),
}).openapi('Movie');
// 電影列表響應 Schema
const MovieListResponseSchema = z.object({
    success: z.boolean().openapi({
        description: '是否成功',
        example: true
    }),
    resultCode: z.string().openapi({
        description: '結果代碼',
        example: '200'
    }),
    resultMessage: z.string().openapi({
        description: '結果訊息',
        example: ''
    }),
    items: z.array(MovieSchema).openapi({
        description: '電影列表'
    }),
}).openapi('MovieListResponse');
// 按日期分組的電影列表 Schema
const MovieGroupByDateSchema = z.object({
    releaseDate: z.string().openapi({
        description: '上映日期',
        example: '2021-12-15'
    }),
    movies: z.array(z.object({
        id: z.string().openapi({
            description: '電影 ID',
            example: '12345'
        }),
        poster: z.string().optional().openapi({
            description: '海報圖片網址',
            example: 'https://example.com/poster.jpg'
        }),
        name: z.string().openapi({
            description: '電影名稱',
            example: '蜘蛛人：無家日'
        }),
    })).openapi({
        description: '該日期的電影列表'
    }),
}).openapi('MovieGroupByDate');
// 按日期分組的電影列表響應 Schema
const MovieGroupByDateResponseSchema = z.object({
    success: z.boolean().openapi({
        description: '是否成功',
        example: true
    }),
    resultCode: z.string().openapi({
        description: '結果代碼',
        example: '200'
    }),
    resultMessage: z.string().openapi({
        description: '結果訊息',
        example: ''
    }),
    items: z.array(MovieGroupByDateSchema).openapi({
        description: '按日期分組的電影列表'
    }),
}).openapi('MovieGroupByDateResponse');
const TheaterSchema = z.object({
    id: z.string().openapi({
        description: '影院 ID',
        example: '67890'
    }),
    name: z.string().openapi({
        description: '影院名稱',
        example: '信義威秀'
    }),
    address: z.string().openapi({
        description: '影院地址',
        example: '台北市信義區松壽路20號'
    }),
}).openapi('Theater');
// 影院列表響應 Schema
const TheaterListResponseSchema = z.object({
    success: z.boolean().openapi({
        description: '是否成功',
        example: true
    }),
    resultCode: z.string().openapi({
        description: '結果代碼',
        example: '200'
    }),
    resultMessage: z.string().openapi({
        description: '結果訊息',
        example: ''
    }),
    items: z.array(TheaterSchema).openapi({
        description: '影院列表'
    }),
}).openapi('TheaterListResponse');
// 電影場次資訊 Schema
const MovieTimesSchema = z.object({
    id: z.string().openapi({
        description: '電影 ID',
        example: '12345'
    }),
    name: z.string().openapi({
        description: '電影名稱',
        example: '蜘蛛人：無家日'
    }),
    description: z.string().openapi({
        description: '電影描述',
        example: '漫威英雄系列最新作品'
    }),
    runtime: z.number().openapi({
        description: '片長（分鐘）',
        example: 148
    }),
    poster: z.string().openapi({
        description: '海報圖片網址',
        example: 'https://example.com/poster.jpg'
    }),
    trailer: z.string().openapi({
        description: '預告片網址',
        example: 'https://example.com/trailer.mp4'
    }),
    currentDate: z.string().openapi({
        description: '查詢日期',
        example: '2024-01-15'
    }),
    releaseDate: z.string().openapi({
        description: '上映日期',
        example: '2021-12-15'
    }),
    cerImg: z.string().openapi({
        description: '分級圖片網址',
        example: 'https://example.com/rating.png'
    }),
    citys: z.array(z.object({
        id: z.string().openapi({
            description: '城市 ID',
            example: '1'
        }),
        name: z.string().openapi({
            description: '城市名稱',
            example: '台北市'
        }),
    })).openapi({
        description: '可觀看城市列表'
    }),
}).openapi('MovieTimes');
// 影院場次 Schema
const TheaterTimesSchema = z.object({
    id: z.string().openapi({
        description: '影院 ID',
        example: '67890'
    }),
    name: z.string().openapi({
        description: '影院名稱',
        example: '信義威秀'
    }),
    versions: z.array(z.object({
        name: z.string().openapi({
            description: '版本名稱',
            example: '數位'
        }),
        times: z.array(z.string()).openapi({
            description: '場次時間列表',
            example: ['10:00', '12:30', '15:00']
        }),
    })).openapi({
        description: '版本和場次資訊'
    }),
}).openapi('TheaterTimes');
// 電影場次響應 Schema
const MovieTimesResponseSchema = z.object({
    success: z.boolean().openapi({
        description: '是否成功',
        example: true
    }),
    resultCode: z.string().openapi({
        description: '結果代碼',
        example: '200'
    }),
    resultMessage: z.string().openapi({
        description: '結果訊息',
        example: ''
    }),
    item: MovieTimesSchema.optional().openapi({
        description: '電影資訊'
    }),
    items: z.array(TheaterTimesSchema).openapi({
        description: '影院場次列表'
    }),
}).openapi('MovieTimesResponse');
// 威秀電影資訊 Schema
const VieShowMovieSchema = z.object({
    id: z.string().openapi({
        description: '電影 ID',
        example: '12345'
    }),
    title: z.string().openapi({
        description: '電影名稱',
        example: '蜘蛛人：無家日'
    }),
    titleEN: z.string().openapi({
        description: '英文名稱',
        example: 'Spider-Man: No Way Home'
    }),
    imgSrc: z.string().openapi({
        description: '圖片網址',
        example: 'https://www.vscinemas.com.tw/vsweb/upload/film/film_20211215123456.jpg'
    }),
    url: z.string().openapi({
        description: '詳細頁面網址',
        example: 'https://www.vscinemas.com.tw/vsweb/film/detail.aspx?id=12345'
    }),
    time: z.string().openapi({
        description: '上映時間資訊',
        example: '2021-12-15'
    }),
    theaterMarks: z.array(z.string()).openapi({
        description: '影院標記',
        example: ['IMAX', '4DX']
    }),
}).openapi('VieShowMovie');
// 威秀場次資訊 Schema
const VieShowTimesSchema = z.object({
    id: z.string().openapi({
        description: '場次 ID',
        example: 'U3BpZGVyLU1hbjogTm8gV2F5IEhvbWU='
    }),
    cinema: z.string().openapi({
        description: '影院名稱',
        example: '台北信義威秀影城'
    }),
    name: z.string().openapi({
        description: '電影名稱',
        example: '蜘蛛人：無家日'
    }),
    nameEN: z.string().openapi({
        description: '英文名稱',
        example: 'Spider-Man: No Way Home'
    }),
    showTimes: z.array(z.object({
        date: z.string().openapi({
            description: '日期',
            example: '2021-12-15'
        }),
        times: z.array(z.string()).openapi({
            description: '場次時間',
            example: ['10:00', '12:30', '15:00']
        }),
    })).openapi({
        description: '場次資訊'
    }),
}).openapi('VieShowTimes');
// 威秀電影列表響應 Schema
const VieShowMovieListResponseSchema = z.object({
    success: z.boolean().openapi({
        description: '是否成功',
        example: true
    }),
    resultCode: z.string().openapi({
        description: '結果代碼',
        example: '200'
    }),
    resultMessage: z.string().openapi({
        description: '結果訊息',
        example: ''
    }),
    items: z.array(VieShowMovieSchema).openapi({
        description: '電影列表'
    }),
}).openapi('VieShowMovieListResponse');
// 威秀場次列表響應 Schema
const VieShowTimesListResponseSchema = z.object({
    success: z.boolean().openapi({
        description: '是否成功',
        example: true
    }),
    resultCode: z.string().openapi({
        description: '結果代碼',
        example: '200'
    }),
    resultMessage: z.string().openapi({
        description: '結果訊息',
        example: ''
    }),
    items: z.array(VieShowTimesSchema).openapi({
        description: '場次列表'
    }),
}).openapi('VieShowTimesListResponse');
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
                    schema: MovieRatingListResponseSchema,
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
                    schema: MovieRatingDetailResponseSchema,
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
                    schema: CityListResponseSchema,
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
                    schema: MovieListResponseSchema,
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
                    schema: MovieGroupByDateResponseSchema,
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
                    schema: MovieGroupByDateResponseSchema,
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
                    schema: TheaterListResponseSchema,
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
                    schema: MovieTimesResponseSchema,
                },
            },
            description: '成功取得電影場次',
        },
    },
});
// 影院詳細資訊 Schema
const TheaterDetailSchema = z.object({
    id: z.string().openapi({
        description: '影院 ID',
        example: '67890'
    }),
    name: z.string().openapi({
        description: '影院名稱',
        example: '信義威秀'
    }),
    url: z.string().openapi({
        description: '影院網址',
        example: 'https://www.vscinemas.com.tw/vsweb/theater/detail.aspx?id=67890'
    }),
    address: z.string().openapi({
        description: '影院地址',
        example: '台北市信義區松壽路20號'
    }),
    geo: z.any().optional().openapi({
        description: '地理位置資訊',
        example: { latitude: 25.0330, longitude: 121.5654 }
    }),
    telephone: z.string().openapi({
        description: '聯絡電話',
        example: '02-8786-7788'
    }),
    openingHours: z.string().openapi({
        description: '營業時間',
        example: '每日 10:00-22:00'
    }),
}).openapi('TheaterDetail');
// 影院電影資訊 Schema
const TheaterMovieSchema = z.object({
    id: z.string().openapi({
        description: '電影 ID',
        example: '12345'
    }),
    title: z.string().openapi({
        description: '電影名稱',
        example: '蜘蛛人：無家日'
    }),
    image: z.string().openapi({
        description: '電影圖片網址',
        example: 'https://example.com/movie.jpg'
    }),
    runtime: z.string().openapi({
        description: '片長',
        example: '148分'
    }),
    cerImg: z.string().openapi({
        description: '分級圖片網址',
        example: 'https://example.com/rating.png'
    }),
    versions: z.array(z.object({
        name: z.string().openapi({
            description: '版本名稱',
            example: '數位'
        }),
        times: z.array(z.string()).openapi({
            description: '場次時間',
            example: ['10:00', '12:30', '15:00']
        }),
    })).openapi({
        description: '版本和場次資訊'
    }),
}).openapi('TheaterMovie');
// 影院場次響應 Schema
const TheaterTimesResponseSchema = z.object({
    success: z.boolean().openapi({
        description: '是否成功',
        example: true
    }),
    resultCode: z.string().openapi({
        description: '結果代碼',
        example: '200'
    }),
    resultMessage: z.string().openapi({
        description: '結果訊息',
        example: ''
    }),
    item: TheaterDetailSchema.optional().openapi({
        description: '影院詳細資訊'
    }),
    items: z.array(TheaterMovieSchema).openapi({
        description: '影院電影列表'
    }),
}).openapi('TheaterTimesResponse');
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
                    schema: TheaterTimesResponseSchema,
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
                    schema: VieShowMovieListResponseSchema,
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
                    schema: VieShowMovieListResponseSchema,
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
                    schema: VieShowTimesListResponseSchema,
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
        keyword = keyword ? `${keyword}` : '';
        const result = new ResultListGenericVM();
        const items = await searchMovieRating(keyword);
        result.items = items;
        result.setResultValue(true, ResultCode.success);
        const key = `movie-rating-${keyword}`;
        const cacheValue = lruCache.get(key);
        if (cacheValue?.[0]?.no !== items?.[0]?.no && keyword.includes('戰車')) {
            items.forEach(async (item) => {
                const movieDoc = await MovieRatingModel.findOne({ no: item.no });
                if (!movieDoc) {
                    const { id, ...other } = item;
                    await MovieRatingModel.create(other);
                    sendNotifyMessage({
                        message: `
--- 電影分級查詢結果: "${keyword}" ---
找到一筆新的資料: ${item.title}
            `
                    });
                }
            });
            lruCache.set(key, items, 1000 * 60 * 60 * 24 * 30);
        }
        return c.json(result);
    }
    catch (err) {
        throw err;
    }
});
app.openapi(ratingDetailRoute, async (c) => {
    try {
        let { certificateNumber } = c.req.param();
        if (!certificateNumber) {
            throw Error('parameters is empty');
        }
        const key = `movie-rating-details-${certificateNumber}`;
        const result = new ResultGenericVM();
        const cacheValue = lruCache.get(key);
        if (cacheValue) {
            result.item = cacheValue;
        }
        else {
            result.item = await searchMovieRatingDetails(certificateNumber);
        }
        result.setResultValue(true, ResultCode.success);
        lruCache.set(key, result.item, 1000 * 60 * 60 * 24 * 30);
        return c.json(result);
    }
    catch (err) {
        throw err;
    }
});
app.openapi(cityRoute, async (c) => {
    try {
        const result = new ResultListGenericVM();
        result.items = await getCityList();
        result.setResultValue(true, ResultCode.success);
        return c.json(result);
    }
    catch (err) {
        throw err;
    }
});
app.openapi(movieListRoute, async (c) => {
    try {
        const result = new ResultListGenericVM();
        result.items = await getMovieList();
        result.setResultValue(true, ResultCode.success);
        return c.json(result);
    }
    catch (err) {
        throw err;
    }
});
app.openapi(movieListGroupRoute, async (c) => {
    try {
        const result = new ResultListGenericVM();
        result.items = await getMovieListGroupByDate();
        result.setResultValue(true, ResultCode.success);
        return c.json(result);
    }
    catch (err) {
        throw err;
    }
});
app.openapi(nextMovieRoute, async (c) => {
    try {
        const result = new ResultListGenericVM();
        result.items = await getMovieListGroupByDate('next');
        result.setResultValue(true, ResultCode.success);
        return c.json(result);
    }
    catch (err) {
        throw err;
    }
});
app.openapi(theaterRoute, async (c) => {
    try {
        const { cityId } = c.req.query();
        const result = new ResultListGenericVM();
        result.items = await getTheaterList(cityId);
        result.setResultValue(true, ResultCode.success);
        return c.json(result);
    }
    catch (err) {
        throw err;
    }
});
app.openapi(movieTimesRoute, async (c) => {
    try {
        const { movieId } = c.req.param();
        const { cityId } = c.req.query();
        const result = new ResultListGenericVM();
        const { item, items } = await getMovieTimes(movieId, cityId);
        result.item = item;
        result.items = items;
        result.setResultValue(true, ResultCode.success);
        return c.json(result);
    }
    catch (err) {
        throw err;
    }
});
app.openapi(theaterTimesRoute, async (c) => {
    try {
        const { theaterId } = c.req.param();
        const { date, cityId } = c.req.query();
        const result = new ResultListGenericVM();
        const { item, items } = await getTheaterTimes(theaterId, cityId, date);
        result.item = item;
        result.items = items;
        result.setResultValue(true, ResultCode.success);
        return c.json(result);
    }
    catch (err) {
        throw err;
    }
});
app.openapi(vieshowNowRoute, async (c) => {
    try {
        const result = new ResultListGenericVM();
        const key = `movie-vieshow-now`;
        const cacheValue = lruCache.get(key);
        if (cacheValue) {
            result.items = cacheValue;
        }
        else {
            const movieList = await getVieShowNowMovieList();
            result.items = movieList;
            lruCache.set(key, movieList, 1000 * 60 * 60 * 2);
        }
        result.setResultValue(true, ResultCode.success);
        return c.json(result);
    }
    catch (err) {
        throw err;
    }
});
app.openapi(vieshowComingRoute, async (c) => {
    try {
        const result = new ResultListGenericVM();
        const key = `movie-vieshow-coming`;
        const cacheValue = lruCache.get(key);
        if (cacheValue) {
            result.items = cacheValue;
        }
        else {
            const movieList = await getVieShowComingMovieList();
            result.items = movieList;
            lruCache.set(key, movieList, 1000 * 60 * 60 * 2);
        }
        result.setResultValue(true, ResultCode.success);
        return c.json(result);
    }
    catch (err) {
        throw err;
    }
});
app.openapi(vieshowShowTimesRoute, async (c) => {
    try {
        const { 'cinema-code': cinemaCode } = c.req.query();
        const result = new ResultListGenericVM();
        if (!cinemaCode) {
            throw new Error('cinema-code is empty.');
        }
        const key = `movie-vieshow-show-times-${cinemaCode}`;
        const cacheValue = lruCache.get(key);
        if (cacheValue) {
            result.items = cacheValue;
        }
        else {
            const movieList = await getVieShowMovieShowTimes(cinemaCode);
            result.items = movieList;
            lruCache.set(key, movieList, 1000 * 60 * 5);
        }
        result.setResultValue(true, ResultCode.success);
        return c.json(result);
    }
    catch (err) {
        throw err;
    }
});
export default app;
