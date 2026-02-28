import { OpenAPIHono } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import { z } from 'zod';

import { lruCache } from '../utilities/lru-cache';
import { getFareData, getTravelTimeData, getTimetableData, getFirstLastTrainData } from '../libs/taoyuan-mrt.lib';
import { ResultCode, ResultListGenericVM } from '../view-models/result.vm';

const app = new OpenAPIHono();

const TAG = '桃園機場捷運';
const CACHE_KEYS = {
  fare: 'taoyuan-mrt-fare',
  travelTime: 'taoyuan-mrt-travel-time',
  timetable: 'taoyuan-mrt-timetable',
  firstLastTrain: 'taoyuan-mrt-first-last-train',
} as const;

// === Schemas ===

const FareItemSchema = z.object({
  srcupdatetime: z.string(),
  updatetime: z.string(),
  versionid: z.string(),
  originstationid: z.string(),
  destinationstationid: z.string(),
  traintype: z.string(),
  traveltime: z.string(),
  traveldistance: z.string(),
}).openapi('TaoyuanMrtFareItem');

const TravelTimeItemSchema = z.object({
  路線代碼: z.string(),
  車種: z.string(),
  站間序號: z.string(),
  起站車站代號: z.string(),
  迄站車站代號: z.string(),
  站間行駛時間: z.string(),
}).openapi('TaoyuanMrtTravelTimeItem');

const TimetableEntrySchema = z.object({
  Sequence: z.number(),
  ArrivalTime: z.string(),
  DepartureTime: z.string(),
  TrainType: z.string(),
});

const ServiceDaysSchema = z.object({
  ServiceTag: z.string(),
  Monday: z.boolean(),
  Tuesday: z.boolean(),
  Wednesday: z.boolean(),
  Thursday: z.boolean(),
  Friday: z.boolean(),
  Saturday: z.boolean(),
  Sunday: z.boolean(),
  NationalHolidays: z.boolean(),
});

const TimetableItemSchema = z.object({
  RouteID: z.string(),
  LineID: z.string(),
  StationID: z.string(),
  StationName: z.object({ Zh_tw: z.string(), En: z.string() }),
  Direction: z.string(),
  DestinationStaionID: z.string(),
  DestinStationName: z.object({ Zh_tw: z.string(), En: z.string() }),
  Timetables: z.array(TimetableEntrySchema),
  ServiceDays: ServiceDaysSchema,
  SrcUpdateTime: z.string(),
  UpdateTime: z.string(),
  VersionID: z.string(),
}).openapi('TaoyuanMrtTimetableItem');

const FirstLastTrainItemSchema = z.object({
  LineNo: z.string(),
  LineID: z.string(),
  StationID: z.string(),
  StationName: z.string(),
  DestinationStaionID: z.string(),
  DestinStationName: z.string(),
  TrainType: z.string(),
  FirstTrainTime: z.string(),
  LastTrainTime: z.string(),
  ServiceDays: z.string(),
  SrcUpdateTime: z.string(),
  UpdateTime: z.string(),
  VersionID: z.string(),
}).openapi('TaoyuanMrtFirstLastTrainItem');

const listResponseSchema = (itemSchema: z.ZodTypeAny) =>
  z.object({
    success: z.boolean(),
    resultCode: z.string(),
    resultMessage: z.string(),
    items: z.array(itemSchema),
  });

// === Routes ===

const fareRoute = createRoute({
  method: 'get',
  path: '/fare',
  summary: '起迄站間票價資料',
  description: '查詢兩站之間的行車時間與距離（A1~A21 所有起迄組合）',
  tags: [TAG],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: listResponseSchema(FareItemSchema),
        },
      },
      description: '成功取得起迄站間資料',
    },
  },
});

const travelTimeRoute = createRoute({
  method: 'get',
  path: '/travel-time',
  summary: '列車站間運行時間',
  description: '查詢各站間的實際行駛秒數，區分普通車(1)與直達車(2)',
  tags: [TAG],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: listResponseSchema(TravelTimeItemSchema),
        },
      },
      description: '成功取得站間運行時間',
    },
  },
});

const timetableRoute = createRoute({
  method: 'get',
  path: '/timetable',
  summary: '站別時刻表資料',
  description: '查詢各站的發車時刻（來源：本地 XML，共 72 筆）',
  tags: [TAG],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: listResponseSchema(TimetableItemSchema),
        },
      },
      description: '成功取得站別時刻表',
    },
  },
});

const firstLastTrainRoute = createRoute({
  method: 'get',
  path: '/first-last-train',
  summary: '首末班車時刻',
  description: '查詢各站首班車與末班車時刻（30 筆）',
  tags: [TAG],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: listResponseSchema(FirstLastTrainItemSchema),
        },
      },
      description: '成功取得首末班車時刻',
    },
  },
});

// === Handlers ===

app.openapi(fareRoute, async (c) => {
  const result = new ResultListGenericVM();
  try {
    const cached = lruCache.get(CACHE_KEYS.fare) as any[];
    if (cached) {
      result.items = cached;
    } else {
      result.items = await getFareData();
      if (result.items.length) {
        lruCache.set(CACHE_KEYS.fare, result.items);
      }
    }
    result.setResultValue(true, ResultCode.success);
  } catch (e: any) {
    result.setResultValue(false, ResultCode.error, e.message);
  }
  return c.json(result);
});

app.openapi(travelTimeRoute, async (c) => {
  const result = new ResultListGenericVM();
  try {
    const cached = lruCache.get(CACHE_KEYS.travelTime) as any[];
    if (cached) {
      result.items = cached;
    } else {
      result.items = await getTravelTimeData();
      if (result.items.length) {
        lruCache.set(CACHE_KEYS.travelTime, result.items);
      }
    }
    result.setResultValue(true, ResultCode.success);
  } catch (e: any) {
    result.setResultValue(false, ResultCode.error, e.message);
  }
  return c.json(result);
});

app.openapi(timetableRoute, async (c) => {
  const result = new ResultListGenericVM();
  try {
    result.items = getTimetableData();
    result.setResultValue(true, ResultCode.success);
  } catch (e: any) {
    result.setResultValue(false, ResultCode.error, e.message);
  }
  return c.json(result);
});

app.openapi(firstLastTrainRoute, async (c) => {
  const result = new ResultListGenericVM();
  try {
    const cached = lruCache.get(CACHE_KEYS.firstLastTrain) as any[];
    if (cached) {
      result.items = cached;
    } else {
      result.items = await getFirstLastTrainData();
      if (result.items.length) {
        lruCache.set(CACHE_KEYS.firstLastTrain, result.items);
      }
    }
    result.setResultValue(true, ResultCode.success);
  } catch (e: any) {
    result.setResultValue(false, ResultCode.error, e.message);
  }
  return c.json(result);
});

export default app;
