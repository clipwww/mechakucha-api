import { OpenAPIHono } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import { z } from 'zod';

import { ResultCode, ResultListGenericVM } from '../view-models/result.vm';
import { checkEplusTickets, getEplusWbcTicketMessage, type TicketInfo } from '../libs/line-bot/eplus';
import { client } from '../libs/line-bot';

const app = new OpenAPIHono();

const TicketInfoSchema = z.object({
  articleTitle: z.string().openapi({ example: 'Japan vs Taipei' }),
  date: z.string().openapi({ example: '2026/03/05 19:00' }),
  index: z.number().int().openapi({ example: 1 }),
}).openapi('EplusTicketInfo');

const TicketListResponseSchema = z.object({
  success: z.boolean(),
  resultCode: z.string(),
  resultMessage: z.string(),
  items: z.array(TicketInfoSchema),
}).openapi('EplusTicketListResponse');

const checkTicketsRoute = createRoute({
  method: 'get',
  path: '/wbc/check',
  summary: '檢查 eplus WBC 票券狀態',
  description: '觸發 eplus WBC 票券檢查並回傳可購票賽事清單',
  tags: ['工具服務'],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: TicketListResponseSchema,
        },
      },
      description: '成功取得票券檢查結果',
    },
  },
});

const notifyTicketsRoute = createRoute({
  method: 'get',
  path: '/wbc/notify',
  summary: '檢查 eplus WBC 並廣播通知',
  description: '觸發 eplus WBC 票券檢查並在有票時廣播 LINE 訊息',
  tags: ['工具服務'],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: TicketListResponseSchema,
        },
      },
      description: '成功取得票券檢查結果',
    },
  },
});

app.openapi(checkTicketsRoute, async (c) => {
  try {
    const result = new ResultListGenericVM<TicketInfo>();
    result.items = await checkEplusTickets();
    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    throw err;
  }
});

app.openapi(notifyTicketsRoute, async (c) => {
  try {
    const result = new ResultListGenericVM<TicketInfo>();
    result.items = await checkEplusTickets();

    const message = await getEplusWbcTicketMessage();
    if (message) {
      client.broadcast(message);
    }

    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    throw err;
  }
});

export default app;
