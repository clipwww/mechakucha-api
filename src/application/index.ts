import  dotenv from 'dotenv';
const result = dotenv.config();
const env = result.parsed;
console.log(env);

import  express from "express"
import  bodyParser from "body-parser";
import  helmet from "helmet";
import  cookieParser from 'cookie-parser';
import  xmlBodyparser from 'express-xml-bodyparser';
import  moment from 'moment-timezone';
import  path from 'path';
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

        this.app.use(errorHandlerMiddleware);

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