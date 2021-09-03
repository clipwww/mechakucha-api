import { NextFunction } from 'express';

import { RequestExtension, ResponseExtension } from '../view-models/extension.vm';
import { AppError, ResultCode, ResultGenericVM } from '../view-models/result.vm';

export const responseEndMiddleware = async (req: RequestExtension, res: ResponseExtension, next: NextFunction) => {
  if (res.result) {
    res.json(res.result);
  } else {
    res.status(+ResultCode.error).send('No Result.');
  }
};


export async function errorHandlerMiddleware(error, req: RequestExtension, res: ResponseExtension, next) {
  const ret = new ResultGenericVM();

  if (error instanceof AppError) {
    ret.setResultValue(false, ResultCode.error, error.message)
  } else if (error instanceof Error) {
    ret.setResultValue(false, ResultCode.error, error.message)
  } else {
    ret.setResultValue(false, ResultCode.unknownError, `${error}`)
  }
  
  res.json(ret);
  res.end();
}


export const endMiddlewares = [responseEndMiddleware, errorHandlerMiddleware]