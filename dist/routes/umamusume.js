"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const result_vm_1 = require("../view-models/result.vm");
const utilities_1 = require("../utilities");
const moment_1 = __importDefault(require("moment"));
const router = (0, express_1.Router)();
router.get('/', async (req, res, next) => {
    try {
        const result = new result_vm_1.ResultGenericVM();
        const key = 'umamusume';
        const value = utilities_1.lruCache.get(key);
        if (value && (0, moment_1.default)().isBefore(value.updateTime, 'day')) {
            result.item = value;
        }
        else {
            const { data: db } = await utilities_1.axiosInstance.get(`https://raw.githubusercontent.com/wrrwrr111/pretty-derby/master/src/assert/db.json`);
            result.item = db;
        }
        res.result = result.setResultValue(true, result_vm_1.ResultCode.success);
        next();
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=umamusume.js.map