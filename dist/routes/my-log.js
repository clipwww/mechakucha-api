"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const result_vm_1 = require("../view-models/result.vm");
const google_sheets_lib_1 = require("../libs/google-sheets.lib");
const router = (0, express_1.Router)();
router.get('/movie', async (req, res, next) => {
    try {
        const result = new result_vm_1.ResultListGenericVM();
        result.items = await (0, google_sheets_lib_1.getMovieLog)();
        res.result = result.setResultValue(true, result_vm_1.ResultCode.success);
        next();
    }
    catch (err) {
        next(err);
    }
});
router.get('/mi/:type', async (req, res, next) => {
    try {
        const { type } = req.params;
        const result = new result_vm_1.ResultListGenericVM();
        result.items = await (0, google_sheets_lib_1.getMiLog)(type);
        res.result = result.setResultValue(true, result_vm_1.ResultCode.success);
        next();
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=my-log.js.map