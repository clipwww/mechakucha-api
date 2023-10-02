"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.endMiddlewares = exports.errorHandlerMiddleware = exports.responseEndMiddleware = void 0;
const result_vm_1 = require("../view-models/result.vm");
const responseEndMiddleware = async (req, res, next) => {
    if (res.result) {
        res.json(res.result);
    }
    else {
        res.status(+result_vm_1.ResultCode.error).send('No Result.');
    }
};
exports.responseEndMiddleware = responseEndMiddleware;
async function errorHandlerMiddleware(error, req, res, next) {
    const ret = new result_vm_1.ResultGenericVM();
    if (error instanceof result_vm_1.AppError) {
        ret.setResultValue(false, result_vm_1.ResultCode.error, error.message);
    }
    else if (error instanceof Error) {
        ret.setResultValue(false, result_vm_1.ResultCode.error, error.message);
    }
    else {
        ret.setResultValue(false, result_vm_1.ResultCode.unknownError, `${error}`);
    }
    res.json(ret);
    res.end();
}
exports.errorHandlerMiddleware = errorHandlerMiddleware;
exports.endMiddlewares = [exports.responseEndMiddleware, errorHandlerMiddleware];
//# sourceMappingURL=end.middleware.js.map