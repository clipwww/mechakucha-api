import fetch from 'node-fetch';
import * as FormData from 'form-data';

const notifyURL = 'https://notify-api.line.me/api/notify';

interface Params {
  message: string;
  notificationDisabled?: boolean;
  stickerPackageId?: string;
  stickerId?: string;
  imageThumbnail?: string;
  imageFullsize?: string;
}

export const sendNotifyMessage = async (token: string, params: Params): Promise<boolean> => {
  console.log('token', token)
  try {
    const form = new FormData();

    for (const key in params) {
      form.append(key, params[key]);
    }

    const ret = await fetch(notifyURL, {
      method: 'POST',
      body: form,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    const json = await ret.json();

    return json.status === 200;
  } catch (err) {
    console.error(err);
  }
}