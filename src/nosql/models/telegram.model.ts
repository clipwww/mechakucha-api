import { Schema, Document, model } from 'mongoose';

import { idGenerator } from '../../utilities';

export interface TelegramChatDocumentDef extends Document {
  id?: string;
  chatId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  dateCreated?: Date;
  dateUpdated?: Date;
}

const TelegramChat = new Schema({
  id: {
    type: String,
    default: idGenerator.generateV4UUID(),
  },
  chatId: {
    type: Number,
    required: true,
    unique: true,
    index: true,
  },
  username: {
    type: String,
    default: ''
  },
  firstName: {
    type: String,
    default: ''
  },
  lastName: {
    type: String,
    default: ''
  },
  dateCreated: {
    type: Date,
    default: new Date()
  },
  dateUpdated: {
    type: Date,
    default: null
  },
});

export const TelegramChatModel = model('telegram-chat', TelegramChat);
