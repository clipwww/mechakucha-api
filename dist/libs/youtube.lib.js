"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseXMLtoData = void 0;
const xml2json_1 = require("xml2json");
const parseXMLtoData = (xmlStr) => {
    var _a, _b, _c, _d, _e;
    const data = JSON.parse((0, xml2json_1.toJson)(xmlStr));
    const self = (_d = (_c = (_b = (_a = data.feed) === null || _a === void 0 ? void 0 : _a.link) === null || _b === void 0 ? void 0 : _b.find(link => link.rel === 'self')) === null || _c === void 0 ? void 0 : _c.href) !== null && _d !== void 0 ? _d : '';
    return {
        entry: (_e = data === null || data === void 0 ? void 0 : data.feed) === null || _e === void 0 ? void 0 : _e.entry,
        self
    };
};
exports.parseXMLtoData = parseXMLtoData;
//# sourceMappingURL=youtube.lib.js.map