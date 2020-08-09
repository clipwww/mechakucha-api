import { Router } from 'express';

import { endMiddlewares } from '../middlewares';
import notifications from './notifications';
import agefans from './agefans';
import movie from './movie';
import komica from './komica';
import himawari from './himawari';
import niconico from './niconico';
import convert from './convert';

const router = Router();

router
.use('/notifications', notifications)
.use('/agefans', agefans, ...endMiddlewares)
.use('/movie', movie, ...endMiddlewares)
.use('/komica', komica, ...endMiddlewares)
.use('/himawari', himawari, ...endMiddlewares)
.use('/niconico', niconico, ...endMiddlewares)
.use('/convert', convert, ...endMiddlewares)

export default router;