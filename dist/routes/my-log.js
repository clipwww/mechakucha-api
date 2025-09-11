"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const result_vm_1 = require("../view-models/result.vm");
const google_sheets_lib_1 = require("../libs/google-sheets.lib");
const app = new hono_1.Hono();
app.get('/movie', async (c) => {
    try {
        const result = new result_vm_1.ResultListGenericVM();
        result.items = await (0, google_sheets_lib_1.getMovieLog)();
        result.setResultValue(true, result_vm_1.ResultCode.success);
        return c.json(result);
    }
    catch (err) {
        throw err;
    }
});
app.get('/mi/:type', async (c) => {
    try {
        const { type } = c.req.param();
        const result = new result_vm_1.ResultListGenericVM();
        result.items = await (0, google_sheets_lib_1.getMiLog)(type);
        result.setResultValue(true, result_vm_1.ResultCode.success);
        return c.json(result);
    }
    catch (err) {
        throw err;
    }
});
exports.default = app;
//# sourceMappingURL=my-log.js.map