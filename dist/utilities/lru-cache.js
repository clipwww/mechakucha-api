"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lruCache = void 0;
const lru_cache_1 = __importDefault(require("lru-cache"));
exports.lruCache = new lru_cache_1.default({
    max: 10000,
    maxAge: 1000 * 60,
});
//# sourceMappingURL=lru-cache.js.map