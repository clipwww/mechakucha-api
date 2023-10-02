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
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_xml_bodyparser_1 = __importDefault(require("express-xml-bodyparser"));
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const path_1 = __importDefault(require("path"));
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
        this.app = (0, express_1.default)();
        this.app
            .use('/webhook', ...middlewares_1.lineWebhookMiddlewares)
            .use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            next();
        })
            .use((0, helmet_1.default)())
            .use(body_parser_1.default.urlencoded({ extended: true }))
            .use(body_parser_1.default.json())
            .use((0, express_xml_bodyparser_1.default)())
            .use((0, cookie_parser_1.default)())
            .use(routes_1.default)
            .use(express_1.default.static(path_1.default.join(__dirname, '../apidoc')));
        this.app.use(middlewares_1.errorHandlerMiddleware);
        return;
    }
    async startListenPort() {
        const port = process.env.PORT;
        this.app.listen(port, () => {
            console.info(`${Application.applicationName}`, `port on ${port}`);
            (0, agenda_1.initSchedule)();
        });
    }
}
exports.Application = Application;
Application.applicationName = "my-api";
//# sourceMappingURL=index.js.map