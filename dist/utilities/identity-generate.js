"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.idGenerator = void 0;
const uuid_1 = require("uuid");
const shortid_1 = __importDefault(require("shortid"));
class IdentityGenerate {
    generateV4UUID() {
        return (0, uuid_1.v4)();
    }
    generateShortId() {
        return shortid_1.default.generate();
    }
}
exports.idGenerator = new IdentityGenerate();
//# sourceMappingURL=identity-generate.js.map