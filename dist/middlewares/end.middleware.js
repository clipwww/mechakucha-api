import { Hono } from 'hono';
import { ResultCode, ResultGenericVM } from '../view-models/result.vm';
export const responseEndMiddleware = async (c, next) => {
    // In Hono, we don't need this middleware as we return responses directly
    await next();
};
export const errorHandlerMiddleware = (err, c) => {
    const ret = new ResultGenericVM();
    if (err instanceof Error) {
        ret.setResultValue(false, ResultCode.error, err.message);
    }
    else {
        ret.setResultValue(false, ResultCode.unknownError, `${err}`);
    }
    return c.json(ret, 500);
};
export const endMiddlewares = [responseEndMiddleware];
