"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserProfile = exports.createUserProfile = exports.getUserProfile = exports.getChatTokens = exports.getTokenStatus = exports.sendNotifyMessage = exports.postNotifyMessage = exports.handleSubscribe = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const form_data_1 = __importDefault(require("form-data"));
const line_model_1 = require("../nosql/models/line.model");
const notifyURL = 'https://notify-api.line.me/api/notify';
const tokenURL = 'https://notify-bot.line.me/oauth/token';
const statusURL = 'https://notify-api.line.me/api/status';
const handleSubscribe = async (code, redirect_uri) => {
    var _a;
    console.log('code', code);
    console.log('redirect_uri', redirect_uri);
    try {
        const form = new form_data_1.default();
        form.append('grant_type', 'authorization_code');
        form.append('redirect_uri', redirect_uri);
        form.append('client_id', process.env.NOTIFY_CLIENT_ID);
        form.append('client_secret', process.env.NOTIFY_CLIENT_SECRET);
        form.append('code', code);
        const ret = await (0, node_fetch_1.default)(tokenURL, {
            method: 'POST',
            body: form,
        });
        const json = await ret.json();
        console.log(json);
        if (json.status !== 200) {
            return false;
        }
        const token = json.access_token;
        const status = await (0, exports.getTokenStatus)(token);
        await line_model_1.LineChatTokenModel.create({
            name: (_a = status === null || status === void 0 ? void 0 : status.target) !== null && _a !== void 0 ? _a : '',
            token,
        });
        return true;
    }
    catch (err) {
        console.error(err);
        return false;
    }
};
exports.handleSubscribe = handleSubscribe;
const postNotifyMessage = async (token, params) => {
    console.log('token', token);
    try {
        if (!token) {
            throw Error('token is empty.');
        }
        const form = new form_data_1.default();
        for (const key in params) {
            form.append(key, params[key]);
        }
        const ret = await (0, node_fetch_1.default)(notifyURL, {
            method: 'POST',
            body: form,
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const json = await ret.json();
        return json.status === 200;
    }
    catch (err) {
        console.error(err);
    }
};
exports.postNotifyMessage = postNotifyMessage;
const sendNotifyMessage = async (params) => {
    const tokens = await (0, exports.getChatTokens)();
    const resultArr = await Promise.all(tokens.map(token => (0, exports.postNotifyMessage)(token, params)));
    return resultArr.every(bool => bool);
};
exports.sendNotifyMessage = sendNotifyMessage;
const getTokenStatus = async (token) => {
    try {
        const ret = await (0, node_fetch_1.default)(statusURL, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const json = await ret.json();
        console.log(json);
        if (json.status !== 200) {
            return;
        }
        return json.status === 200 ? json : null;
    }
    catch (err) {
        return null;
    }
};
exports.getTokenStatus = getTokenStatus;
const getChatTokens = async () => {
    const items = await line_model_1.LineChatTokenModel.find({});
    return items.map(item => item.token);
};
exports.getChatTokens = getChatTokens;
const getUserProfile = async (userId) => {
    const user = await line_model_1.LineProfileModel.findOne({
        userId,
    });
    return user.toJSON();
};
exports.getUserProfile = getUserProfile;
const createUserProfile = async (profile) => {
    const user = await line_model_1.LineProfileModel.create(Object.assign({}, profile));
    return user.toJSON();
};
exports.createUserProfile = createUserProfile;
const updateUserProfile = async (profile) => {
    line_model_1.LineProfileModel.updateOne({
        userId: profile.userId,
    }, {
        $set: {
            displayName: profile.displayName,
            pictureUrl: profile.pictureUrl,
            statusMessage: profile.statusMessage,
            dateUpdated: new Date()
        }
    });
};
exports.updateUserProfile = updateUserProfile;
//# sourceMappingURL=line.lib.js.map