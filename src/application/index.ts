import * as dotenv from 'dotenv';
const result = dotenv.config();
const env = result.parsed;
console.log(env);

import * as express from "express"
import * as bodyParser from "body-parser";
import * as helmet from "helmet";
import * as cookieParser from 'cookie-parser';
import * as xmlBodyparser from 'express-xml-bodyparser';
import * as moment from 'moment-timezone';
import * as path from 'path';
import { SignatureValidationFailed, JSONParseError } from '@line/bot-sdk';

import { connectMongoDB } from '../nosql/mongodb-data-accessor';
import { lineWebhookMiddlewares, errorHandlerMiddleware } from '../middlewares';
import routes from '../routes';
import { initSchedule } from '../agenda';

moment.tz.setDefault('Asia/Taipei');

export class Application {
    private app: express.Application = null
    static readonly applicationName: string = "my-api";

    async start(): Promise<void> {

        connectMongoDB();
        this.setRouters();
        await this.startListenPort();
    }



    private async setRouters(): Promise<void> {
        this.app = express();
        this.app
            .use('/webhook', ...lineWebhookMiddlewares)
            .use((req, res, next) => {
                res.header('Access-Control-Allow-Origin', '*');
                res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
                next();
            })
            .use(helmet())
            .use(bodyParser.urlencoded({ extended: true }))
            .use(bodyParser.json())
            .use(xmlBodyparser())
            .use(cookieParser())
            .use(routes)
            .use(express.static(path.join(__dirname, '../apidoc')))

        this.app.use((err: Error, req, res, next) => {
            if (err instanceof SignatureValidationFailed) {
                res.status(401).send(err.signature)
                return
            } else if (err instanceof JSONParseError) {
                res.status(400).send(err.raw)
                return
            }
            next(err) // will throw default 500
        }, errorHandlerMiddleware)

        return
    }

    private async startListenPort() {
        const port = process.env.PORT;
        this.app.listen(port, () => {
            console.info(`${Application.applicationName}`, `port on ${port}`)
            initSchedule();
        });
    }

}