"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCwbXMLtoItems = void 0;
const xml2json_1 = require("xml2json");
const parseCwbXMLtoItems = (xmlStr) => {
    var _a, _b, _c;
    const data = JSON.parse((0, xml2json_1.toJson)(xmlStr));
    return (_c = (_b = (_a = data === null || data === void 0 ? void 0 : data.rss) === null || _a === void 0 ? void 0 : _a.channel) === null || _b === void 0 ? void 0 : _b.item) !== null && _c !== void 0 ? _c : [];
};
exports.parseCwbXMLtoItems = parseCwbXMLtoItems;
//# sourceMappingURL=cwb.lib.js.map