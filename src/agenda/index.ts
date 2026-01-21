import { Agenda, type JobAttributesData, Job } from 'agenda/dist';

import { client } from '../libs/line-bot';
import { getRankingMessage } from '../libs/line-bot/niconico';
import { getVieShowComingMovieListMessage } from '../libs/line-bot/movie';
import { getEplusWbcTicketMessage } from '../libs/line-bot/eplus';

const mongoConnectionString = `${process.env.MONGODB_URI}?retryWrites=true&w=majority`;

export const agenda = new Agenda({
  db: { address: mongoConnectionString },
}, function (err, c) {
  if (err) {
    console.log(err);
    throw err;
  }
  agenda.emit('ready');
  agenda.cancel({ nextRunAt: null });
});

// agenda.define('send email report', { priority: JobPriority.high, concurrency: 10 }, async (job: Job<JobAttributesData>) => {
//   const { to } = job.attrs.data;
//   console.log(to);
// });

agenda.define('send nico ranking', {}, async (job: Job<JobAttributesData>) => {
  console.log(`send nico ranking at ${job.attrs.failedAt}`)
  const message = await getRankingMessage();
  client.broadcast(message)
});

agenda.define('send vieshow coming', {}, async (job: Job<JobAttributesData>) => {
  console.log(`send vieshow coming at ${job.attrs.failedAt}`)
  const message = await getVieShowComingMovieListMessage();
  client.broadcast(message)
});

agenda.define('eplus 2026 wbc ticket check', {}, async (job: Job<JobAttributesData>) => {
  console.log(`eplus 2026 wbc ticket check at ${+ new Date()}`);
  const message = await getEplusWbcTicketMessage();
  if (message) {
    client.broadcast(message);
  }
})

export async function initSchedule() {
  console.log('init agenda')
  await agenda.start();

  // ref. cron time

  agenda.every("0 9,18,23 * * *", 'send nico ranking', {}, {
    timezone: 'Asia/Taipei'
  });

  agenda.every("0 16 * * *", 'send vieshow coming', {}, {
    timezone: 'Asia/Taipei'
  });

  agenda.every("*/15 * * * *", 'eplus 2026 wbc ticket check', {}, {
    timezone: 'Asia/Taipei'
  });
}

