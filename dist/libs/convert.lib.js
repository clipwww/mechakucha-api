"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.m3u8toStream = void 0;
const m3u8stream_1 = __importDefault(require("m3u8stream"));
const m3u8toStream = (m3u8Url) => {
    const stream = (0, m3u8stream_1.default)(m3u8Url);
    stream.on('progress', (segment, totalSegments, downloaded) => {
        console.log(`${segment.num} of ${totalSegments} segments ` +
            `(${(segment.num / totalSegments * 100).toFixed(2)}%) ` +
            `${(downloaded / 1024 / 1024).toFixed(2)}MB downloaded`);
    });
    return stream;
};
exports.m3u8toStream = m3u8toStream;
//# sourceMappingURL=convert.lib.js.map