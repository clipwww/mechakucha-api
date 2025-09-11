"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.endMiddlewares = exports.errorHandlerMiddleware = exports.responseEndMiddleware = void 0;
const result_vm_1 = require("../view-models/result.vm");
const responseEndMiddleware = async (c, next) => {
    // In Hono, we don't need this middleware as we return responses directly
    await next();
};
exports.responseEndMiddleware = responseEndMiddleware;
const errorHandlerMiddleware = (err, c) => {
    const ret = new result_vm_1.ResultGenericVM();
    if (err instanceof Error) {
        ret.setResultValue(false, result_vm_1.ResultCode.error, err.message);
    }
    else {
        ret.setResultValue(false, result_vm_1.ResultCode.unknownError, `${err}`);
    }
    return c.json(ret, 500);
};
exports.errorHandlerMiddleware = errorHandlerMiddleware;
exports.endMiddlewares = [exports.responseEndMiddleware];
//# sourceMappingURL=end.middleware.js.map