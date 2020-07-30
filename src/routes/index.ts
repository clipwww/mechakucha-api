import { Router } from 'express';

import { responseEndMiddleware } from '../middlewares';
import notifications from './notifications';
import agefans from './agefans';
import movie from './movie';
import komica from './komica';
import himawari from './himawari';

const router = Router();

router
.use('/notifications', notifications)
.use('/agefans', agefans, responseEndMiddleware)
.use('/movie', movie, responseEndMiddleware)
.use('/komica', komica, responseEndMiddleware)
.use('/himawari', himawari, responseEndMiddleware)

export default router;