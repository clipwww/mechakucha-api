import { Agenda, JobAttributesData, JobPriority, Job } from 'agenda/dist';

import { client } from '../libs/line-bot';
import { getRankingMessage } from '../libs/line-bot/niconico';

const mongoConnectionString = `${process.env.MONGODB_URI}?retryWrites=true&w=majority&poolSize=100`;

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

export async function initSchedule() {
  console.log('init agenda')
  await agenda.start();


  agenda.every("0 9,23 * * *", 'send nico ranking', {}, {
    timezone: 'Asia/Taipei'
  });
}

