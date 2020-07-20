import { Router } from 'express';

import { responseEndMiddleware } from '../middlewares';
import notifications from './notifications';
import agefans from './agefans';

const router = Router();

router
.use('/notifications', notifications)
.use('/agefans', agefans, responseEndMiddleware)

export default router;