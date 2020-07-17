import { Schema, Model, Document, model } from 'mongoose';

import { idGenerator } from '../../utilities';

export interface LineChatTokenDocumentDef extends Document {
  id?: string;
  token: string;
  name: string;
  dateCreated?: Date;
}

const LineChatToken = new Schema({
  id: {
    type: String,
    default: idGenerator.generateV4UUID(),
  },
  token: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    default: ''
  },
  dateCreated: { 
    type: Date, 
    default: new Date() 
  },
})

export const LineChatTokenModel: Model<LineChatTokenDocumentDef> = model('line-chat-token', LineChatToken);