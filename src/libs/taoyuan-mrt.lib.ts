import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
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

let timetableCache: TimetableData[] | null = null;

export function getTimetableData(): TimetableData[] {
  if (timetableCache) return timetableCache;

  const xmlPath = path.resolve(import.meta.dirname, '../data/StationTimeTable.xml');
  const xml = fs.readFileSync(xmlPath, 'utf-8');
  const parser = new XMLParser({
    ignoreAttributes: true,
    isArray: (name) => name === 'Timetable' || name === 'StationTimeTable',
    numberParseOptions: { leadingZeros: false, hex: false },
  });
  const parsed = parser.parse(xml);
  const items: TimetableData[] = parsed.ArrayOfStationTimeTable.StationTimeTable.map((item: any) => ({
    ...item,
    Direction: String(item.Direction),
    VersionID: String(item.VersionID),
    Timetables: (Array.isArray(item.Timetables?.Timetable) ? item.Timetables.Timetable : []).map((t: any) => ({
      ...t,
      TrainType: String(t.TrainType),
    })),
  }));

  timetableCache = items;
  return items;
}

export function getFirstLastTrainData() {
  return fetchOpenData<FirstLastTrainData>(RESOURCE_IDS.firstLastTrain);
}
