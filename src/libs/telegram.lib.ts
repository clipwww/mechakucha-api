import fetch from 'node-fetch';

import { TelegramChatModel } from '../nosql/models/telegram.model';

export interface TelegramChatProfile {
  chatId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
}

export interface TelegramSendParams {
  message: string;
  parseMode?: 'Markdown' | 'MarkdownV2' | 'HTML';
  disablePreview?: boolean;
}

const getTelegramApiBase = () => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN must be set');
  }
  return `https://api.telegram.org/bot${token}`;
}

export const upsertTelegramChat = async (profile: TelegramChatProfile) => {
  await TelegramChatModel.updateOne(
    { chatId: profile.chatId },
    {
      $set: {
        username: profile.username ?? '',
        firstName: profile.firstName ?? '',
        lastName: profile.lastName ?? '',
        dateUpdated: new Date()
      },
      $setOnInsert: {
        dateCreated: new Date()
      }
    },
    { upsert: true, setDefaultsOnInsert: true }
  );
}

export const getTelegramChatIds = async () => {
  const items = await TelegramChatModel.find({});
  return items.map(item => item.chatId);
}

export const sendTelegramMessageToChat = async (chatId: number, params: TelegramSendParams): Promise<boolean> => {
  try {
    const apiBase = getTelegramApiBase();
    const ret = await fetch(`${apiBase}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: params.message,
        parse_mode: params.parseMode,
        disable_web_page_preview: params.disablePreview ?? true,
      })
    });

    const json = await ret.json();
    return json.ok === true;
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    return false;
  }
}

export const sendTelegramMessage = async (params: TelegramSendParams): Promise<boolean> => {
  try {
    const chatIds = await getTelegramChatIds();
    if (!chatIds.length) {
      console.warn('[TELEGRAM] no chat id registered');
      return false;
    }

    const results = await Promise.all(chatIds.map(chatId => sendTelegramMessageToChat(chatId, params)));
    return results.every(bool => bool);
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    return false;
  }
}
