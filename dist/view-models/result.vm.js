export class AppError extends Error {
    code;
    constructor(param) {
        super(param.message);
        this.code = param.code ?? ResultCode.unknownError;
        this.name = param.name || 'AppError';
    }
}
export var ResultCode;
(function (ResultCode) {
    ResultCode["success"] = "200";
    ResultCode["notModified"] = "304";
    ResultCode["error"] = "500";
    ResultCode["unknownError"] = "999";
})(ResultCode || (ResultCode = {}));
export class ResultVM {
    success;
    resultCode;
    resultMessage;
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
export class ResultGenericVM extends ResultVM {
    item;
}
export class ResultListGenericVM extends ResultVM {
    items;
    item;
    page;
}
