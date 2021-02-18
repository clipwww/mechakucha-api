import * as moment from 'moment';
import { axiosInstance } from '../utilities';

export const fetchGoogleSheet = (key: string, workSheetId = 'od6') => {
  return axiosInstance.get(`https://spreadsheets.google.com/feeds/list/${key}/${workSheetId}/public/values?alt=json`);
}

export const getMovieLog = async () => {
  const COLUMN_MAPPING = {
    'gsx$日期': 'date',
    'gsx$片名': 'title',
    'gsx$國別': 'area',
    'gsx$版本': 'version',
    'gsx$影城': 'theater',
    'gsx$票價': 'price',
    'gsx$手續費': 'fee',
    'gsx$張數': 'tickets',
    'gsx$折扣': 'discount',
    'gsx$花費': 'cost',
    'gsx$備註': 'memo'
  }

  try {
    const { data } = await fetchGoogleSheet('1wUt7W8p7c-tlaUCZOI6OwGJODfO-TE7VwPMaBvlv9pQ');

    return data.feed.entry.map((item: { 'gsx$日期': { $t: string }; }) => {
      const newObj = {
        id: '',
        date: ''
      }
      for (const key in item) {
        const value = item[key].$t;
        switch (key) {
          case 'id':
            newObj.id = value.split('/')?.pop() ?? `${+new Date()}`;
            break;
          case 'gsx$日期':
            newObj.date = moment(value, 'YYYY/MM/DD HH:mm').toISOString();
            break;
          default:
            newObj[COLUMN_MAPPING[key]] = isNaN(value) || !value ? value : +value;
            break;
        }
      }

      return newObj;
    })
  } catch (err) {
    return [];
  }
}

export const getMiLog = async (workSheetId: '1' | '2' | '3'): Promise<[]> => {
  /**
   * 1. sport
   * 2. activity
   * 3. sleep
   */
  try {
    const { data } = await fetchGoogleSheet('1Ea0efiYHiwUJlR4LdUhPdOKbBmW4_FU4sqsCqtOyfCQ', workSheetId);

    return data.feed.entry.map((item: { 'gsx$日期': { $t: string }; }) => {
      const newObj = {
        id: ''
      };

      for (const key in item) {
        const value = item[key].$t;
        const newKey = key.replace('gsx$', '');

        switch (newKey) {
          case 'id':
            newObj.id = value.split('/')?.pop() ?? `${+new Date()}`;
            break;
          case 'date':
            newObj[newKey] = moment(value, 'YYYY/MM/DD HH:mm').toISOString();
            break;
          case 'starttime':
          case 'lastsynctime':
          case 'start':
          case 'stop':
            newObj[newKey] = moment(value * 1000).toISOString();
            break;
          default:
            newObj[newKey] = isNaN(value) || !value ? value : +value;
            break;
        }
      }

      return newObj;
    })
  } catch (err) {
    return [];
  }
}