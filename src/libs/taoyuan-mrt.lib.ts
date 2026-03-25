import https from 'node:https';
import LRU from 'lru-cache';
import { XMLParser } from 'fast-xml-parser';
import { httpClient } from '../utilities/http-client';

const BASE_URL = 'https://opendata.tycg.gov.tw/api/v1/dataset.api_access';

const RESOURCE_IDS = {
  fare: '22e689bd-3b8b-4d28-b354-e5a0bc5b1527',
  travelTime: '4b4ea6d2-84b6-4614-b67d-9fe50084fca3',
  timetable: '83358afd-010a-4989-b63a-bbf20692e408',
  firstLastTrain: '8731ff1e-0598-4855-b8ab-b76f0aa37227',
} as const;

// 桃園市開放資料平台的 SSL 憑證鏈不完整，需跳過驗證
const agent = new https.Agent({ rejectUnauthorized: false });

async function fetchOpenData<T>(rid: string): Promise<T[]> {
  const response = await httpClient.get(BASE_URL, {
    agent: { https: agent },
    searchParams: {
      rid,
      format: 'json',
      limit: 1000,
    },
  }).json<T[]>();
  return response;
}

export interface FareData {
  srcupdatetime: string;
  updatetime: string;
  versionid: string;
  originstationid: string;
  destinationstationid: string;
  traintype: string;
  traveltime: string;
  traveldistance: string;
}

export interface TravelTimeData {
  路線代碼: string;
  車種: string;
  站間序號: string;
  起站車站代號: string;
  迄站車站代號: string;
  站間行駛時間: string;
}

export interface TimetableEntry {
  Sequence: number;
  ArrivalTime: string;
  DepartureTime: string;
  TrainType: string;
}

export interface ServiceDays {
  ServiceTag: string;
  Monday: boolean;
  Tuesday: boolean;
  Wednesday: boolean;
  Thursday: boolean;
  Friday: boolean;
  Saturday: boolean;
  Sunday: boolean;
  NationalHolidays: boolean;
}

export interface TimetableData {
  RouteID: string;
  LineID: string;
  StationID: string;
  StationName: { Zh_tw: string; En: string };
  Direction: string;
  DestinationStaionID: string;
  DestinStationName: { Zh_tw: string; En: string };
  Timetables: TimetableEntry[];
  ServiceDays: ServiceDays;
  SrcUpdateTime: string;
  UpdateTime: string;
  VersionID: string;
}

export function getFareData() {
  return fetchOpenData<FareData>(RESOURCE_IDS.fare);
}

export function getTravelTimeData() {
  return fetchOpenData<TravelTimeData>(RESOURCE_IDS.travelTime);
}

export interface FirstLastTrainData {
  LineNo: string;
  LineID: string;
  StationID: string;
  StationName: string;
  DestinationStaionID: string;
  DestinStationName: string;
  TrainType: string;
  FirstTrainTime: string;
  LastTrainTime: string;
  ServiceDays: string;
  SrcUpdateTime: string;
  UpdateTime: string;
  VersionID: string;
}

/** XML 解析後的原始型別（數字欄位尚未轉為字串） */
interface RawTimetableEntry {
  Sequence: number;
  ArrivalTime: string;
  DepartureTime: string;
  TrainType: number;
}

interface RawStationTimeTable {
  RouteID: string;
  LineID: string;
  StationID: string;
  StationName: { Zh_tw: string; En: string };
  Direction: number;
  DestinationStaionID: string;
  DestinStationName: { Zh_tw: string; En: string };
  Timetables: { Timetable: RawTimetableEntry[] } | null;
  ServiceDays: ServiceDays;
  SrcUpdateTime: string;
  UpdateTime: string;
  VersionID: number;
}

interface RawParsedXml {
  ArrayOfStationTimeTable: {
    StationTimeTable: RawStationTimeTable[];
  };
}

const SEVEN_DAYS = 1000 * 60 * 60 * 24 * 7;
const timetableCache = new LRU<string, TimetableData[]>({
  max: 1,
  maxAge: SEVEN_DAYS,
});
const TIMETABLE_CACHE_KEY = 'timetable';

export async function getTimetableData(forceReload = false): Promise<TimetableData[]> {
  if (!forceReload) {
    const cached = timetableCache.get(TIMETABLE_CACHE_KEY);
    if (cached) return cached;
  }

  const xml = await httpClient.get(`https://opendata.tycg.gov.tw/api/v1/dataset/8e6201c2-1968-4920-aba3-1a68093dab53/resource/83358afd-010a-4989-b63a-bbf20692e408/download`, {
    agent: { https: agent },
    searchParams: {
      // rid: RESOURCE_IDS.timetable,
      // format: 'xml',
      // limit: 1000,
    },
  }).text();
  console.log(xml)

  const parser = new XMLParser({
    ignoreAttributes: true,
    isArray: (name) => name === 'Timetable' || name === 'StationTimeTable',
    numberParseOptions: { leadingZeros: false, hex: false },
  });
  const parsed = parser.parse(xml) as RawParsedXml;
  
  const items: TimetableData[] = parsed.ArrayOfStationTimeTable.StationTimeTable.map((item) => ({
    ...item,
    Direction: String(item.Direction),
    VersionID: String(item.VersionID),
    Timetables: (item.Timetables?.Timetable ?? []).map((t) => ({
      ...t,
      TrainType: String(t.TrainType),
    })),
  }));

  timetableCache.set(TIMETABLE_CACHE_KEY, items);
  return items;
}

export function getFirstLastTrainData() {
  return fetchOpenData<FirstLastTrainData>(RESOURCE_IDS.firstLastTrain);
}
