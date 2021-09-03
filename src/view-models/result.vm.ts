export class AppError extends Error {
  code: ResultCode
  constructor(param: ErrorInitParameter) {
      super(param.message)
      this.code = param.code ?? ResultCode.unknownError;
      this.name = param.name || 'AppError'
  }
}

export interface ErrorInitParameter {
  message: string
  code?: ResultCode
  name?: string
}

export enum ResultCode {
  success = '200',
  notModified = '304',
  error = '500',
  unknownError = '999'
}

export class ResultVM {
  success: boolean;
  resultCode: string;
  resultMessage: string;

  constructor() {
    this.success = false;
    this.resultCode = '';
    this.resultMessage = '';
  }

  setResultValue(success?: boolean, resultCode?: string, resultMessage?: string): any;
  setResultValue(): any {
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

export class ResultGenericVM<T> extends ResultVM {
  item!: T;
}

export class ResultListGenericVM<T> extends ResultVM {
  items!: T[];
  item?: any;
  page?: {
    index: number;
    size: number;
    dataAmount: number;
    pageAmount?: number;
  }
}
