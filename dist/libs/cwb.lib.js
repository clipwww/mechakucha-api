"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCwbXMLtoItems = void 0;
const xml2json_1 = require("xml2json");
const parseCwbXMLtoItems = (xmlStr) => {
    const data = JSON.parse((0, xml2json_1.toJson)(xmlStr));
    return data?.rss?.channel?.item ?? [];
};
exports.parseCwbXMLtoItems = parseCwbXMLtoItems;
//# sourceMappingURL=cwb.lib.js.map