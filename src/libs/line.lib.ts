import fetch from 'node-fetch';
import * as FormData from 'form-data';

import { LineChatTokenModel, LineProfileModel } from '../nosql/models/line.model';
import { LineProfile } from '../view-models/line.vm';

const notifyURL = 'https://notify-api.line.me/api/notify';
const tokenURL = 'https://notify-bot.line.me/oauth/token';
const statusURL = 'https://notify-api.line.me/api/status';

// https://notify-bot.line.me/oauth/authorize?response_type=code&scope=notify&response_mode=form_post&client_id={client_id}&redirect_uri={redirect_uri}&state=f094a459-1d16-42d6-a709-c2b61ec53d60

interface Params {
  message: string;
  notificationDisabled?: boolean;
  stickerPackageId?: string;
  stickerId?: string;
  imageThumbnail?: string;
  imageFullsize?: string;
}

export const handleSubscribe = async (code: string, redirect_uri: string) => {
  console.log('code', code);
  console.log('redirect_uri', redirect_uri);
  try {
    const form = new FormData();
    form.append('grant_type', 'authorization_code');
    form.append('redirect_uri', redirect_uri);
    form.append('client_id', process.env.NOTIFY_CLIENT_ID);
    form.append('client_secret', process.env.NOTIFY_CLIENT_SECRET);
    form.append('code', code);

    const ret = await fetch(tokenURL, {
      method: 'POST',
      body: form,
    })
    const json = await ret.json();
    console.log(json);
    if (json.status !== 200) {
      return false;
    }
    const token = json.access_token;
    const status = await getTokenStatus(token);

    await LineChatTokenModel.create({
      name: status?.target ?? '',
      token,
    })
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export const postNotifyMessage = async (token: string, params: Params): Promise<boolean> => {
  console.log('token', token)
  try {
    if (!token) {
      throw Error('token is empty.')
    }
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

export const sendNotifyMessage = async (params: Params) => {
  const tokens = await getChatTokens();
  const resultArr = await Promise.all(tokens.map(token => postNotifyMessage(token, params)));
  return resultArr.every(bool => bool);
}

export const getTokenStatus = async (token: string) => {
  try {
    const ret = await fetch(statusURL, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    const json = await ret.json();
    console.log(json);
    if (json.status !== 200) {
      return;
    }
    return json.status === 200 ? json : null;
  } catch (err) {
    return null;
  }
}

export const getChatTokens = async () => {
  const items = await LineChatTokenModel.find({});
  return items.map(item => item.token);
}


export const getUserProfile = async (userId: string) => {
  const user = await LineProfileModel.findOne({
    userId,
  })
  return user.toJSON();
}

export const createUserProfile = async (profile: LineProfile) => {
  const user = await LineProfileModel.create({
    ...profile,
  })
  return user.toJSON();
}

export const updateUserProfile = async (profile: LineProfile) => {
  LineProfileModel.updateOne({
    userId: profile.userId,
  },
    {
      $set: {
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
        statusMessage: profile.statusMessage,
        dateUpdated: new Date()
      }
    })
}