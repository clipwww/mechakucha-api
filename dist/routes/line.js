"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const result_vm_1 = require("../view-models/result.vm");
const line_lib_1 = require("../libs/line.lib");
const router = (0, express_1.Router)();
router.get('/user/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = new result_vm_1.ResultGenericVM();
        const user = await (0, line_lib_1.getUserProfile)(id);
        result.item = user;
        res.result = result.setResultValue(true, result_vm_1.ResultCode.success);
        next();
    }
    catch (err) {
        next(err);
    }
});
router.post('/user', async (req, res, next) => {
    try {
        const { profile } = req.body;
        const result = new result_vm_1.ResultGenericVM();
        const user = await (0, line_lib_1.createUserProfile)(profile);
        result.item = user;
        res.result = result.setResultValue(true, result_vm_1.ResultCode.success);
        next();
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=line.js.map