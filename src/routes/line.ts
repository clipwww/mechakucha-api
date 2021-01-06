import { Router } from 'express';

import { ResultCode, ResultGenericVM } from '../view-models/result.vm';
import { ResponseExtension } from '../view-models/extension.vm';
import { createUserProfile, getUserProfile } from '../libs/line.lib';

const router = Router();


router.get('/user/:id', async (req, res: ResponseExtension, next) => {
  try {
    const { id } = req.params;
    const result = new ResultGenericVM();

    const user = await getUserProfile(id);

    result.item = user;

    res.result = result.setResultValue(true, ResultCode.success)

    next();
  } catch (err) {
    next(err);
  }
})


router.post('/user', async (req, res: ResponseExtension, next) => {
  try {
    const { profile } = req.body;
    const result = new ResultGenericVM();

    const user = await createUserProfile(profile);

    result.item = user;

    res.result = result.setResultValue(true, ResultCode.success)

    next();
  } catch (err) {
    next(err);
  }
})


export default router;