import * as express from "express"
import * as bodyParser from "body-parser";
import * as helmet from "helmet";
import * as cookieParser from 'cookie-parser';
import * as xmlBodyparser from 'express-xml-bodyparser';
import * as moment from 'moment-timezone';

import routes from '../routes';

moment.tz.setDefault('Asia/Taipei');

export class Application {
    private app: express.Application = null
    static readonly applicationName: string = "my-api";

    async start(): Promise<void> {
        
        this.setRouters();
        await this.startListenPort();
    }



    private async setRouters(): Promise<void> {
        this.app = express();
        this.app.use(helmet())
            .use(bodyParser.urlencoded({ extended: true }))
            .use(bodyParser.json())
            .use(xmlBodyparser())
            .use(cookieParser())
            .use(routes);
        return
    }

    private async startListenPort() {
        const port = process.env.PORT;
        this.app.listen(port, () => {
            console.info(`${Application.applicationName}`, `port on ${port}`)
        });
    }

}