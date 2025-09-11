import  FormData from 'form-data';
import  moment from 'moment';

import { httpClient } from '../utilities';

interface BahamutDanmakuVM {
  "text": string;
  "color": string;
  "size": number;
  "position": number;
  "time": number;
  "sn": number;
  "userid": string;
}

export const getBahumutDanmaku = async (sn: string) => {
  const formData = new FormData()
  formData.append('sn', sn)

  const { body: data } = await httpClient.post(`https://ani.gamer.com.tw/ajax/danmuGet.php`, {
    body: formData,
    headers: {
      ...formData.getHeaders()
    }
  })

  const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
  return (parsedData as BahamutDanmakuVM[]).map(item => {
    return {
      ...item,
      time: item.time / 10,
      mode: ['rtl', 'top', 'bottom'][item.position],
      digital_time: moment.utc(item.time * 100).format('HH:mm:ss'),
    }
  })
}