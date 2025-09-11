"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Application = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const result = dotenv_1.default.config();
const env = result.parsed;
console.log(env);
const hono_1 = require("hono");
const node_server_1 = require("@hono/node-server");
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const mongodb_data_accessor_1 = require("../nosql/mongodb-data-accessor");
const middlewares_1 = require("../middlewares");
const routes_1 = __importDefault(require("../routes"));
const agenda_1 = require("../agenda");
moment_timezone_1.default.tz.setDefault('Asia/Taipei');
class Application {
    constructor() {
        this.app = null;
    }
    async start() {
        (0, mongodb_data_accessor_1.connectMongoDB)();
        this.setRouters();
        await this.startListenPort();
    }
    async setRouters() {
        this.app = new hono_1.Hono();
        this.app
            .use('/webhook', ...middlewares_1.lineWebhookMiddlewares)
            .use('*', async (c, next) => {
            c.header('Access-Control-Allow-Origin', '*');
            c.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            await next();
        })
            .route('/', routes_1.default);
        this.app.onError(middlewares_1.errorHandlerMiddleware);
        return;
    }
    async startListenPort() {
        const port = process.env.PORT || '3000';
        (0, node_server_1.serve)({
            fetch: this.app.fetch,
            port: parseInt(port),
        });
        console.info(`${Application.applicationName}`, `port on ${port}`);
        (0, agenda_1.initSchedule)();
    }
}
exports.Application = Application;
Application.applicationName = "my-api";
//# sourceMappingURL=index.js.map