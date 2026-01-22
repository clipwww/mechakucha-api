import { OpenAPIHono } from '@hono/zod-openapi';

import { endMiddlewares } from '../middlewares';
import notifications from './notifications';
import agefans from './agefans';
import movie from './movie';
import komica from './komica';
import niconico from './niconico';
import bahamut from './bahamut';
import bilibili from './bilibili';
import myMovieRecord from './my-movie-record';
import anime1 from './anime1';
import line from './line';
import myLog from './my-log';
import blog from './blog';
import webPush from './web-push';
import eplus from './eplus';
import telegram from './telegram';

const app = new OpenAPIHono();

app
.route('/notifications', notifications)
.route('/agefans', agefans)
.route('/movie', movie)
.route('/komica', komica)
.route('/niconico', niconico)
.route('/bahamut', bahamut)
.route('/bilibili', bilibili)
.route('/my-movie-record', myMovieRecord)
.route('/anime1', anime1)
.route('/line', line)
.route('/my-log', myLog)
.route('/blog', blog)
.route('/web-push', webPush)
.route('/eplus', eplus)
.route('/telegram', telegram)

// Apply end middlewares to all routes
app.use('*', ...endMiddlewares);

export default app;