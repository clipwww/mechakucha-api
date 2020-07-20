export enum ResultCode {
  success = '200',
  notModified = '304',
  error = '500'
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
  page?: {
    index: number;
    size: number;
    amount: number;
  }
}
