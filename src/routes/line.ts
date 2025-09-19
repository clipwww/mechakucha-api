import { OpenAPIHono } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import { z } from 'zod';

import { ResultCode, ResultGenericVM } from '../view-models/result.vm';
import { createUserProfile, getUserProfile } from '../libs/line.lib';

const app = new OpenAPIHono();

// Zod schemas
const UserProfileSchema = z.object({
  userId: z.string().openapi({ example: 'U1234567890abcdef' }),
  displayName: z.string().openapi({ example: '張小明' }),
  pictureUrl: z.string().optional().openapi({ example: 'https://example.com/avatar.jpg' }),
  statusMessage: z.string().optional().openapi({ example: 'Hello!' }),
}).openapi('UserProfile');

const CreateUserRequestSchema = z.object({
  profile: UserProfileSchema,
}).openapi('CreateUserRequest');

const UserResponseSchema = z.object({
  success: z.boolean(),
  resultCode: z.string(),
  resultMessage: z.string(),
  item: UserProfileSchema,
}).openapi('UserResponse');

// OpenAPI routes
const getUserRoute = createRoute({
  method: 'get',
  path: '/user/:id',
  summary: '取得用戶資料',
  description: '根據用戶 ID 取得 LINE 用戶資料',
  tags: ['LINE'],
  request: {
    params: z.object({
      id: z.string().min(1).openapi({
        description: '用戶 ID',
        example: 'U1234567890abcdef'
      }),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: UserResponseSchema,
        },
      },
      description: '成功取得用戶資料',
    },
  },
});

const createUserRoute = createRoute({
  method: 'post',
  path: '/user',
  summary: '創建用戶資料',
  description: '創建新的 LINE 用戶資料',
  tags: ['LINE'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateUserRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: UserResponseSchema,
        },
      },
      description: '成功創建用戶資料',
    },
  },
});

// 註冊路由
app.openapi(getUserRoute, async (c) => {
  try {
    const { id } = c.req.param();
    const result = new ResultGenericVM<Awaited<ReturnType<typeof getUserProfile>>>();

    const user = await getUserProfile(id);

    result.item = user;

    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    throw err;
  }
});

app.openapi(createUserRoute, async (c) => {
  try {
    const { profile } = await c.req.json();
    const result = new ResultGenericVM<Awaited<ReturnType<typeof getUserProfile>>>();

    const user = await createUserProfile(profile);

    result.item = user;

    result.setResultValue(true, ResultCode.success);
    return c.json(result);
  } catch (err) {
    throw err;
  }
});

export default app;