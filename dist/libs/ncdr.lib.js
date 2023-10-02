"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseNcdrXMLtoData = void 0;
const fs_1 = __importDefault(require("fs"));
const xml2json_1 = require("xml2json");
const parseNcdrXMLtoData = (path) => {
    return new Promise(reslove => {
        fs_1.default.readFile(path, 'utf8', (err, data) => {
            var _a, _b;
            if (err) {
                return reslove();
            }
            try {
                const alert = JSON.parse((0, xml2json_1.toJson)(data));
                const entry = (_b = (_a = alert === null || alert === void 0 ? void 0 : alert.feed) === null || _a === void 0 ? void 0 : _a.entry) !== null && _b !== void 0 ? _b : [];
                const newEnrty = entry[entry.length - 1];
                return reslove({
                    id: newEnrty.id,
                    title: newEnrty.title,
                    author: newEnrty.author.name,
                    updated: newEnrty.updated,
                    message: newEnrty.summary.$t,
                    category: newEnrty.category.term,
                    link: newEnrty.link.href,
                });
            }
            catch (err) {
                console.error(err);
                return reslove();
            }
        });
    });
};
exports.parseNcdrXMLtoData = parseNcdrXMLtoData;
//# sourceMappingURL=ncdr.lib.js.map