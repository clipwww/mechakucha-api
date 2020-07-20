import { RequestExtension, ResponseExtension } from '../view-models/extension.vm';
import { ResultVM, ResultCode } from '../view-models/result.vm';

export const responseEndMiddleware = async (req: RequestExtension, res: ResponseExtension) => {
  try {
    if (!res.result) {
      throw Error('No Result.')
    }

    res.json(res.result);

  } catch (error) {
    const result = new ResultVM();

    res.json(result.setResultValue(false, ResultCode.error, error.message));

  } finally {
    res.end();
  }
};
