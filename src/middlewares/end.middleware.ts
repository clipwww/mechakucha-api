import { NextFunction } from 'express';

import { RequestExtension, ResponseExtension } from '../view-models/extension.vm';
import { ResultCode } from '../view-models/result.vm';

export const responseEndMiddleware = async (req: RequestExtension, res: ResponseExtension, next: NextFunction) => {
  if (res.result) {
    res.json(res.result);
  } else {
    res.status(+ResultCode.error).send('No Result.');
  }
};

export const errorHandlerMiddleware = async (req: RequestExtension, res: ResponseExtension) => {
  // console.log(res);
  res.status(+ResultCode.error).send().end();
};


export const endMiddlewares = [responseEndMiddleware, errorHandlerMiddleware]