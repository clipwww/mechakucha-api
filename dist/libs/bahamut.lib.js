"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBahumutDanmaku = void 0;
const form_data_1 = __importDefault(require("form-data"));
const moment_1 = __importDefault(require("moment"));
const utilities_1 = require("../utilities");
const getBahumutDanmaku = async (sn) => {
    const formData = new form_data_1.default();
    formData.append('sn', sn);
    const { data } = await utilities_1.axiosInstance.post(`https://ani.gamer.com.tw/ajax/danmuGet.php`, formData, {
        headers: Object.assign({}, formData.getHeaders())
    });
    return data.map(item => {
        return Object.assign(Object.assign({}, item), { time: item.time / 10, mode: ['rtl', 'top', 'bottom'][item.position], digital_time: moment_1.default.utc(item.time * 100).format('HH:mm:ss') });
    });
};
exports.getBahumutDanmaku = getBahumutDanmaku;
//# sourceMappingURL=bahamut.lib.js.map