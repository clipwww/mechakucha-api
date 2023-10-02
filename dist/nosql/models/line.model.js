"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineChatTokenModel = exports.LineProfileModel = void 0;
const mongoose_1 = require("mongoose");
const utilities_1 = require("../../utilities");
const LineChatToken = new mongoose_1.Schema({
    id: {
        type: String,
        default: utilities_1.idGenerator.generateV4UUID(),
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
const LineProfile = new mongoose_1.Schema({
    id: {
        type: String,
        default: utilities_1.idGenerator.generateV4UUID(),
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
exports.LineProfileModel = (0, mongoose_1.model)('line-profile', LineProfile);
exports.LineChatTokenModel = (0, mongoose_1.model)('line-chat-token', LineChatToken);
//# sourceMappingURL=line.model.js.map