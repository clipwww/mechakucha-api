import { Agenda, type JobAttributesData, Job } from 'agenda/dist';

import { getRankingText } from '../libs/line-bot/niconico';
import { getVieShowComingMovieListText } from '../libs/line-bot/movie';
import { getEplusWbcTicketText } from '../libs/line-bot/eplus';
import { sendTelegramMessage } from '../libs/telegram.lib';

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
  console.log(`[AGENDA] send nico ranking | ${new Date().toISOString()}`)
  const message = await getRankingText();
  console.log(message);
  await sendTelegramMessage({ message });
  console.log(`[AGENDA] send nico ranking | broadcast done`)
});

agenda.define('send vieshow coming', {}, async (job: Job<JobAttributesData>) => {
  console.log(`[AGENDA] send vieshow coming | ${new Date().toISOString()}`)
  const message = await getVieShowComingMovieListText();
  console.log(message);
  await sendTelegramMessage({ message });
  console.log(`[AGENDA] send vieshow coming | broadcast done`)
});

agenda.define('eplus 2026 wbc ticket check', {}, async (job: Job<JobAttributesData>) => {
  console.log(`[AGENDA] eplus wbc check | ${new Date().toISOString()}`);
  const message = await getEplusWbcTicketText();
  if (message) {
    await sendTelegramMessage({ message });
    console.log(`[AGENDA] eplus wbc check | broadcast sent`);
  } else {
    console.log(`[AGENDA] eplus wbc check | no tickets available`);
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

  agenda.every("*/10 * * * *", 'eplus 2026 wbc ticket check', {}, {
    timezone: 'Asia/Taipei'
  });

  // Execute immediately on schedule init
  agenda.now('eplus 2026 wbc ticket check', {});
}

