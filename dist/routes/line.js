"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const result_vm_1 = require("../view-models/result.vm");
const line_lib_1 = require("../libs/line.lib");
const app = new hono_1.Hono();
app.get('/user/:id', async (c) => {
    try {
        const { id } = c.req.param();
        const result = new result_vm_1.ResultGenericVM();
        const user = await (0, line_lib_1.getUserProfile)(id);
        result.item = user;
        result.setResultValue(true, result_vm_1.ResultCode.success);
        return c.json(result);
    }
    catch (err) {
        throw err;
    }
});
app.post('/user', async (c) => {
    try {
        const { profile } = await c.req.json();
        const result = new result_vm_1.ResultGenericVM();
        const user = await (0, line_lib_1.createUserProfile)(profile);
        result.item = user;
        result.setResultValue(true, result_vm_1.ResultCode.success);
        return c.json(result);
    }
    catch (err) {
        throw err;
    }
});
exports.default = app;
//# sourceMappingURL=line.js.map