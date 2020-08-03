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

export const errorHandlerMiddleware = async (error: Error, req: RequestExtension, res: ResponseExtension) => {
  console.log('[ERROR]', error)
  console.log(res);
  res.status(+ResultCode.error).send(error.message).end();
};


export const endMiddlewares = [responseEndMiddleware, errorHandlerMiddleware]