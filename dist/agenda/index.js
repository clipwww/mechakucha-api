"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSchedule = exports.agenda = void 0;
const dist_1 = require("agenda/dist");
const line_bot_1 = require("../libs/line-bot");
const niconico_1 = require("../libs/line-bot/niconico");
const movie_1 = require("../libs/line-bot/movie");
const mongoConnectionString = `${process.env.MONGODB_URI}?retryWrites=true&w=majority`;
exports.agenda = new dist_1.Agenda({
    db: { address: mongoConnectionString },
}, function (err, c) {
    if (err) {
        console.log(err);
        throw err;
    }
    exports.agenda.emit('ready');
    exports.agenda.cancel({ nextRunAt: null });
});
// agenda.define('send email report', { priority: JobPriority.high, concurrency: 10 }, async (job: Job<JobAttributesData>) => {
//   const { to } = job.attrs.data;
//   console.log(to);
// });
exports.agenda.define('send nico ranking', {}, async (job) => {
    console.log(`send nico ranking at ${job.attrs.failedAt}`);
    const message = await (0, niconico_1.getRankingMessage)();
    line_bot_1.client.broadcast(message);
});
exports.agenda.define('send vieshow coming', {}, async (job) => {
    console.log(`send vieshow coming at ${job.attrs.failedAt}`);
    const message = await (0, movie_1.getVieShowComingMovieListMessage)();
    line_bot_1.client.broadcast(message);
});
async function initSchedule() {
    console.log('init agenda');
    await exports.agenda.start();
    // ref. cron time
    exports.agenda.every("0 9,18,23 * * *", 'send nico ranking', {}, {
        timezone: 'Asia/Taipei'
    });
    exports.agenda.every("0 16 * * *", 'send vieshow coming', {}, {
        timezone: 'Asia/Taipei'
    });
}
exports.initSchedule = initSchedule;
//# sourceMappingURL=index.js.map