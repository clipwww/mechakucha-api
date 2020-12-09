import { Router } from 'express';

import { endMiddlewares } from '../middlewares';
import notifications from './notifications';
import agefans from './agefans';
import movie from './movie';
import komica from './komica';
import himawari from './himawari';
import niconico from './niconico';
import convert from './convert';
import bahamut from './bahamut';
import bilibili from './bilibili';
import metaFetcher from './meta-fetcher';
import myMovieRecord from './my-movie-record';
import anime1 from './anime1';

const router = Router();

router
.use('/notifications', notifications)
.use('/agefans', agefans, ...endMiddlewares)
.use('/movie', movie, ...endMiddlewares)
.use('/komica', komica, ...endMiddlewares)
.use('/himawari', himawari, ...endMiddlewares)
.use('/niconico', niconico, ...endMiddlewares)
.use('/convert', convert, ...endMiddlewares)
.use('/bahamut', bahamut, ...endMiddlewares)
.use('/bilibili', bilibili, ...endMiddlewares)
.use('/meta-fetcher', metaFetcher, ...endMiddlewares)
.use('/my-movie-record', myMovieRecord, ...endMiddlewares)
.use('/anime1', anime1, ...endMiddlewares)

export default router;