import  dotenv from 'dotenv';
const result = dotenv.config();
const env = result.parsed;
console.log(env);

import  { OpenAPIHono } from "@hono/zod-openapi"
import  { serve } from '@hono/node-server'
import  { Scalar } from '@scalar/hono-api-reference'
import  moment from 'moment-timezone';

import { connectMongoDB } from '../nosql/mongodb-data-accessor';
import { lineWebhookMiddlewares, errorHandlerMiddleware } from '../middlewares';
import routes from '../routes';
import { initSchedule } from '../agenda';

moment.tz.setDefault('Asia/Taipei');

const isDev = false;

export class Application {
    private app: OpenAPIHono | null = null
    static readonly applicationName: string = "my-api";

    async start(): Promise<void> {

        connectMongoDB();
        this.setRouters();
        await this.startListenPort();
    }



    private async setRouters(): Promise<void> {
        this.app = new OpenAPIHono();

        // 先設定 OpenAPI 文檔端點
        this.app.doc('/doc', {
            openapi: '3.0.0',
            info: {
                version: '2.0.0',
                title: 'MechakuCha API',
                description: '滅茶苦茶 API',
            },
            servers: [
                {
                    url: isDev ? `http://localhost:${process.env.PORT || '3000'}` : 'https://mechakucha-api.vercel.app',
                    description: '開發環境',
                },
            ],
        });

        // 設定 Scalar API Reference 端點
        this.app.get('/docs', Scalar({
            url: '/doc',
            pageTitle: 'MechakuCha API 文檔',
            theme: 'purple',
            darkMode: false,
            defaultOpenAllTags: true,
            showSidebar: true,
            layout: 'modern',
            searchHotKey: 'k',
            metaData: {
                title: 'MechakuCha API',
                description: '滅茶苦茶 API',
                ogDescription: '提供滅茶苦茶功能的 REST API',
                ogTitle: 'MechakuCha API 文檔',
                ogImage: null,
                twitterCard: 'summary_large_image',
                twitterTitle: 'MechakuCha API 文檔',
                twitterDescription: '滅茶苦茶 API',
            },
            authentication: {
                preferredSecurityScheme: null,
            },
            servers: [
                {
                    url: isDev ? `http://localhost:${process.env.PORT || '3000'}` : 'https://mechakucha-api.vercel.app',
                    description: '',
                },
                {
                    url: `http://localhost:${process.env.PORT || '3000'}`,
                    description: '本地測試環境',
                },
                {
                    url: 'https://mechakucha-api.vercel.app',
                    description: '正式環境',
                }
            ],
        }));

        // 設定其他路由
        this.app
            .use('/webhook', ...lineWebhookMiddlewares)
            .use('*', async (c, next) => {
                c.header('Access-Control-Allow-Origin', '*');
                c.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
                await next();
            })
            .route('/', routes)

        this.app.get('/', (c) => {
            return c.redirect('/docs')
        })

        this.app.onError(errorHandlerMiddleware);

        return
    }

    private async startListenPort() {
        const port = process.env.PORT || '3000';
        serve({
            fetch: this.app!.fetch,
            port: parseInt(port),
        });
        console.info(`${Application.applicationName}`, `port on ${port}`)
        console.info(`📖 API 文檔: http://localhost:${port}/docs`);
        console.info(`📋 OpenAPI JSON: http://localhost:${port}/doc`);
        initSchedule();
    }

}