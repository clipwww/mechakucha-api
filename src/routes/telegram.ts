import { OpenAPIHono } from '@hono/zod-openapi';

import { upsertTelegramChat } from '../libs/telegram.lib';

const app = new OpenAPIHono();

app.post('/webhook', async (c) => {
  const update = await c.req.json();
  console.log('[TELEGRAM] webhook received', JSON.stringify(update));
  
  const message = update?.message ?? update?.edited_message;
  const chat = message?.chat;

  if (chat?.id) {
    await upsertTelegramChat({
      chatId: chat.id,
      username: chat.username,
      firstName: chat.first_name,
      lastName: chat.last_name,
    });
  }

  return c.json({ ok: true });
});

export default app;
