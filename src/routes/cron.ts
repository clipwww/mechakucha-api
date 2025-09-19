import { OpenAPIHono } from '@hono/zod-openapi';
import { z } from 'zod';
import { getRankingMessage } from '../libs/line-bot/niconico';
import { getVieShowComingMovieListMessage } from '../libs/line-bot/movie';
import { client } from '../libs/line-bot';

const app = new OpenAPIHono();

// Cron endpoint for Nico ranking
app.post('/nico-ranking', async (c) => {
  // Simple auth check - you should use a proper secret
  const authHeader = c.req.header('Authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    console.log('Executing nico ranking cron job');
    const message = await getRankingMessage();
    await client.broadcast(message);
    return c.json({ success: true, message: 'Nico ranking sent' });
  } catch (error) {
    console.error('Error in nico ranking cron:', error);
    return c.json({ error: 'Failed to send nico ranking' }, 500);
  }
});

// Cron endpoint for VieShow coming movies
app.post('/vieshow-coming', async (c) => {
  // Simple auth check
  const authHeader = c.req.header('Authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    console.log('Executing vieshow coming cron job');
    const message = await getVieShowComingMovieListMessage();
    await client.broadcast(message);
    return c.json({ success: true, message: 'VieShow coming movies sent' });
  } catch (error) {
    console.error('Error in vieshow coming cron:', error);
    return c.json({ error: 'Failed to send vieshow coming' }, 500);
  }
});

export default app;