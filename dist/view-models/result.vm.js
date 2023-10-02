"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultListGenericVM = exports.ResultGenericVM = exports.ResultVM = exports.ResultCode = exports.AppError = void 0;
class AppError extends Error {
    constructor(param) {
        var _a;
        super(param.message);
        this.code = (_a = param.code) !== null && _a !== void 0 ? _a : ResultCode.unknownError;
        this.name = param.name || 'AppError';
    }
}
exports.AppError = AppError;
var ResultCode;
(function (ResultCode) {
    ResultCode["success"] = "200";
    ResultCode["notModified"] = "304";
    ResultCode["error"] = "500";
    ResultCode["unknownError"] = "999";
})(ResultCode = exports.ResultCode || (exports.ResultCode = {}));
class ResultVM {
    constructor() {
        this.success = false;
        this.resultCode = '';
        this.resultMessage = '';
    }
    setResultValue() {
        this.success = arguments[0] === undefined ? false : arguments[0];
        this.resultMessage = arguments[2] === undefined ? '' : arguments[2];
        switch (typeof (arguments[1])) {
            case 'string':
                this.resultCode = arguments[1];
                break;
            default:
                this.resultCode = '200';
        }
        return this;
    }
}
exports.ResultVM = ResultVM;
class ResultGenericVM extends ResultVM {
}
exports.ResultGenericVM = ResultGenericVM;
class ResultListGenericVM extends ResultVM {
}
exports.ResultListGenericVM = ResultListGenericVM;
//# sourceMappingURL=result.vm.js.map