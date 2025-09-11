import  dotenv from 'dotenv';
const result = dotenv.config();
const env = result.parsed;
console.log(env);

import  { Hono } from "hono"
import  { serve } from '@hono/node-server'
import  moment from 'moment-timezone';
import { SignatureValidationFailed, JSONParseError } from '@line/bot-sdk';

import { connectMongoDB } from '../nosql/mongodb-data-accessor';
import { lineWebhookMiddlewares, errorHandlerMiddleware } from '../middlewares';
import routes from '../routes';
import { initSchedule } from '../agenda';

moment.tz.setDefault('Asia/Taipei');

export class Application {
    private app: Hono = null
    static readonly applicationName: string = "my-api";

    async start(): Promise<void> {

        connectMongoDB();
        this.setRouters();
        await this.startListenPort();
    }



    private async setRouters(): Promise<void> {
        this.app = new Hono();
        this.app
            .use('/webhook', ...lineWebhookMiddlewares)
            .use('*', async (c, next) => {
                c.header('Access-Control-Allow-Origin', '*');
                c.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
                await next();
            })
            .route('/', routes)

        this.app.onError(errorHandlerMiddleware);

        return
    }

    private async startListenPort() {
        const port = process.env.PORT || '3000';
        serve({
            fetch: this.app.fetch,
            port: parseInt(port),
        });
        console.info(`${Application.applicationName}`, `port on ${port}`)
        initSchedule();
    }

}