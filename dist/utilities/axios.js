"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.axiosInstance = void 0;
const axios_1 = __importDefault(require("axios"));
exports.axiosInstance = axios_1.default.create({
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});
exports.axiosInstance.interceptors.request.use(config => {
    console.log(`[${config.method?.toUpperCase()}] ${config.url} | query: ${JSON.stringify(config?.params || {})} | data: ${JSON.stringify(config?.data || {})}`);
    return config;
}, error => {
    console.error(`[Request Error] ${error}`);
    return Promise.reject(error);
});
exports.axiosInstance.interceptors.response.use(response => {
    return response;
}, error => {
    console.error(`[Response Error] ${error}`);
    return Promise.reject(error);
});
//# sourceMappingURL=axios.js.map