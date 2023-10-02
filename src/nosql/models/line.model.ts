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

export interface LineProfileDocumentDef extends Document {
  id: string;
  userId: string;
  displayName: string;
  pictureUrl: string;
  statusMessage: string;
  dateCreated?: Date;
  dateUpdated?: Date;
}

const LineProfile = new Schema({
  id: {
    type: String,
    default: idGenerator.generateV4UUID(),
  },
  userId: {
    type: String,
    default: ''
  },
  displayName: {
    type: String,
    default: ''
  },
  pictureUrl: {
    type: String,
    default: ''
  },
  statusMessage: {
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
})

export const LineProfileModel = model('line-profile', LineProfile);
export const LineChatTokenModel = model('line-chat-token', LineChatToken);