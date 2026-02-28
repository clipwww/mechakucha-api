import https from 'node:https';
import { httpClient } from '../utilities/http-client';

const BASE_URL = 'https://opendata.tycg.gov.tw/api/v1/dataset.api_access';

const RESOURCE_IDS = {
  fare: '22e689bd-3b8b-4d28-b354-e5a0bc5b1527',
  travelTime: '4b4ea6d2-84b6-4614-b67d-9fe50084fca3',
  timetable: '83358afd-010a-4989-b63a-bbf20692e408',
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

export interface TimetableData {
  RouteID: string;
  LineID: string;
  StationID: string;
  StationName: string;
  Direction: string;
  DestinationStaionID: string;
  DestinStationName: string;
  Timetables: string;
  ServiceDays: string;
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

export function getTimetableData() {
  return fetchOpenData<TimetableData>(RESOURCE_IDS.timetable);
}
