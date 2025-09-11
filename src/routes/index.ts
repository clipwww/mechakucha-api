import { Hono } from 'hono';

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
import line from './line';
import myLog from './my-log';
import umamusume from './umamusume';
import sns from './sns';
import blog from './blog';
import webPush from './web-push';

const app = new Hono();

app
.route('/notifications', notifications)
.route('/agefans', agefans)
.route('/movie', movie)
.route('/komica', komica)
.route('/himawari', himawari)
.route('/niconico', niconico)
.route('/convert', convert)
.route('/bahamut', bahamut)
.route('/bilibili', bilibili)
.route('/meta-fetcher', metaFetcher)
.route('/my-movie-record', myMovieRecord)
.route('/anime1', anime1)
.route('/line', line)
.route('/my-log', myLog)
.route('/umamusume', umamusume)
.route('/sns', sns)
.route('/blog', blog)
.route('/web-push', webPush)

// Apply end middlewares to all routes
app.use('*', ...endMiddlewares);

export default app;