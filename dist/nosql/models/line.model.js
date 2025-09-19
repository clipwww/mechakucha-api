import { Schema, Model, Document, model } from 'mongoose';
import { idGenerator } from '../../utilities';
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
});
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
});
export const LineProfileModel = model('line-profile', LineProfile);
export const LineChatTokenModel = model('line-chat-token', LineChatToken);
