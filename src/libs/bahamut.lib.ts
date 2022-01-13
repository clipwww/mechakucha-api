import  FormData from 'form-data';
import  moment from 'moment';

import { axiosInstance } from '../utilities';

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

  const { data } = await axiosInstance.post(`https://ani.gamer.com.tw/ajax/danmuGet.php`, formData, {
    headers: {
      ...formData.getHeaders()
    }
  })

  return (data as BahamutDanmakuVM[]).map(item => {
    return {
      ...item,
      time: item.time / 10,
      mode: ['rtl', 'top', 'bottom'][item.position],
      digital_time: moment.utc(item.time * 100).format('HH:mm:ss'),
    }
  })
}