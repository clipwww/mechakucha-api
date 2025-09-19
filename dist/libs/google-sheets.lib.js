import moment from 'moment';
import { httpClient } from '../utilities';
export const fetchGoogleSheet = async (key, sheetName = '工作表1') => {
    const response = await httpClient.get(`https://sheets.googleapis.com/v4/spreadsheets/${key}/values/${encodeURIComponent(sheetName)}!A:AA?key=${process.env.GOOGLE_SHEET_API_KEY}`);
    return response;
    // return axiosInstance.get(`https://spreadsheets.google.com/feeds/list/${key}/${workSheetId}/public/values?alt=json`);
};
export const getMovieLog = async () => {
    const COLUMN_MAPPING = {
        '日期': 'date',
        '片名': 'title',
        '國別': 'area',
        '版本': 'version',
        '影城': 'theater',
        '票價': 'price',
        '手續費': 'fee',
        '張數': 'tickets',
        '折扣': 'discount',
        '花費': 'cost',
        '備註': 'memo'
    };
    // const keyArr = Object.keys(COLUMN_MAPPING).map(key => COLUMN_MAPPING[key]);
    try {
        const response = await fetchGoogleSheet('1wUt7W8p7c-tlaUCZOI6OwGJODfO-TE7VwPMaBvlv9pQ');
        const data = JSON.parse(response.body);
        let keyArr = [];
        return data.values.reduce((pre, cur, index) => {
            if (index === 0) {
                keyArr = cur;
                return pre;
            }
            const newObj = {
                id: Buffer.from(cur.join(',')).toString('base64'),
                memo: '',
            };
            cur.forEach((value, index) => {
                const key = COLUMN_MAPPING[keyArr[index]] || keyArr[index];
                switch (key) {
                    case 'date':
                        newObj[key] = moment(value, 'YYYY/MM/DD HH:mm').toISOString();
                        break;
                    default:
                        // @ts-ignore
                        newObj[key] = isNaN(+value) || !value ? value : +value;
                        break;
                }
            });
            pre.push(newObj);
            return pre;
        }, []);
    }
    catch (err) {
        console.log(err);
        return [];
    }
};
export const getMiLog = async (sheetName) => {
    /**
     * 1. sport
     * 2. activity
     * 3. sleep
     */
    try {
        const response = await fetchGoogleSheet('1Ea0efiYHiwUJlR4LdUhPdOKbBmW4_FU4sqsCqtOyfCQ', sheetName);
        const data = JSON.parse(response.body);
        let keyArr = [];
        return data.values.reduce((pre, cur, index) => {
            if (index === 0) {
                keyArr = cur;
                return pre;
            }
            const newObj = {
                id: Buffer.from(cur.join(',')).toString('base64'),
            };
            cur.forEach((value, index) => {
                const key = keyArr[index];
                switch (key) {
                    case 'date':
                        newObj[key] = moment(value, 'YYYY/MM/DD HH:mm').toISOString();
                        break;
                    case 'startTime':
                    case 'lastSyncTime':
                    case 'start':
                    case 'stop':
                        newObj[key] = moment(+value * 1000).toISOString();
                        break;
                    default:
                        // @ts-ignore
                        newObj[key] = isNaN(value) || !value ? value : +value;
                        break;
                }
            });
            pre.push(newObj);
            return pre;
        }, []);
    }
    catch (err) {
        console.log(err);
        return [];
    }
};
