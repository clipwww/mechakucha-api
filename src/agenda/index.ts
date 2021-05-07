import { Agenda, JobAttributesData, JobPriority, Job } from 'agenda/dist';

import { client } from '../libs/line-bot';
import { getRankingMessage } from '../libs/line-bot/niconico';

const mongoConnectionString = `${process.env.MONGODB_URI}?retryWrites=true&w=majority&poolSize=100`;

export const agenda = new Agenda({
  db: { address: mongoConnectionString }
});

// agenda.define('send email report', { priority: JobPriority.high, concurrency: 10 }, async (job: Job<JobAttributesData>) => {
//   const { to } = job.attrs.data;
//   console.log(to);
// });

agenda.define('send nico ranking', {}, async (job: Job<JobAttributesData>) => {
  const message = await getRankingMessage();
  client.pushMessage('U383c9cfcab2d0d16ded2f96ec4337962', message);
});

export async function initSchedule() {
  await agenda.start();
  // await agenda.every("5 seconds", "send email report", {
  //   to: "admin@example.com",
  // });
  agenda.schedule("9:00am", 'send nico ranking', {});
  agenda.schedule("11:00pm", 'send nico ranking', {});
}

