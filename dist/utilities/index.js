"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = exports.puppeteerUtil = exports.axiosInstance = exports.lruCache = exports.idGenerator = void 0;
const identity_generate_1 = require("./identity-generate");
Object.defineProperty(exports, "idGenerator", { enumerable: true, get: function () { return identity_generate_1.idGenerator; } });
const lru_cache_1 = require("./lru-cache");
Object.defineProperty(exports, "lruCache", { enumerable: true, get: function () { return lru_cache_1.lruCache; } });
const axios_1 = require("./axios");
Object.defineProperty(exports, "axiosInstance", { enumerable: true, get: function () { return axios_1.axiosInstance; } });
const puppeteer_util_1 = require("./puppeteer.util");
Object.defineProperty(exports, "puppeteerUtil", { enumerable: true, get: function () { return puppeteer_util_1.puppeteerUtil; } });
function sleep(sec) {
    return new Promise((res) => setTimeout(res, sec * 1000));
}
exports.sleep = sleep;
//# sourceMappingURL=index.js.map