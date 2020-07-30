import { NextFunction } from 'express';

import { RequestExtension, ResponseExtension } from '../view-models/extension.vm';

export const responseEndMiddleware = async (req: RequestExtension, res: ResponseExtension, next: NextFunction) => {
  try {
    if (!res.result) throw Error('No Result.')
    
    res.json(res.result);
  } catch (err) {
    next(err)
  } finally {
    res.end();
  }
};
