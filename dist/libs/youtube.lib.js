"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseXMLtoData = void 0;
const xml2json_1 = require("xml2json");
const parseXMLtoData = (xmlStr) => {
    const data = JSON.parse((0, xml2json_1.toJson)(xmlStr));
    const self = data.feed?.link?.find(link => link.rel === 'self')?.href ?? '';
    return {
        entry: data?.feed?.entry,
        self
    };
};
exports.parseXMLtoData = parseXMLtoData;
//# sourceMappingURL=youtube.lib.js.map