import { Router } from 'express';
import * as moment from 'moment';

import { ResultCode, ResultListGenericVM } from '../view-models/result.vm';
import { ResponseExtension } from '../view-models/extension.vm';
import { axiosInstance } from '../utilities';

const router = Router();

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

router.get('/', async (req, res: ResponseExtension, next) => {
  try {

    const result = new ResultListGenericVM();

    const { data } = await axiosInstance.get('https://spreadsheets.google.com/feeds/list/1wUt7W8p7c-tlaUCZOI6OwGJODfO-TE7VwPMaBvlv9pQ/od6/public/values?alt=json');
    
    result.items = data.feed.entry.map((item: { 'gsx$日期': { $t: string }; }) => {
      const newObj = {
        date: ''
      }
      for(const key in item) {
        const value = item[key].$t;
        switch(key) {
          case 'gsx$日期':
            newObj.date = moment(value, 'YYYY/MM/DD HH:mm').toISOString();
            break;
          default:
            newObj[COLUMN_MAPPING[key]] = isNaN(value) ? value : +value;
            break;
        }
      }

      return newObj;
    });

    res.result = result.setResultValue(true, ResultCode.success)

    next();
  } catch (err) {
    next(err);
  }
})


export default router;