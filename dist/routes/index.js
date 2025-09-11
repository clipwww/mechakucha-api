"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const middlewares_1 = require("../middlewares");
const notifications_1 = __importDefault(require("./notifications"));
const agefans_1 = __importDefault(require("./agefans"));
const movie_1 = __importDefault(require("./movie"));
const komica_1 = __importDefault(require("./komica"));
const himawari_1 = __importDefault(require("./himawari"));
const niconico_1 = __importDefault(require("./niconico"));
const convert_1 = __importDefault(require("./convert"));
const bahamut_1 = __importDefault(require("./bahamut"));
const bilibili_1 = __importDefault(require("./bilibili"));
const meta_fetcher_1 = __importDefault(require("./meta-fetcher"));
const my_movie_record_1 = __importDefault(require("./my-movie-record"));
const anime1_1 = __importDefault(require("./anime1"));
const line_1 = __importDefault(require("./line"));
const my_log_1 = __importDefault(require("./my-log"));
const umamusume_1 = __importDefault(require("./umamusume"));
const sns_1 = __importDefault(require("./sns"));
const blog_1 = __importDefault(require("./blog"));
const web_push_1 = __importDefault(require("./web-push"));
const app = new hono_1.Hono();
app
    .route('/notifications', notifications_1.default)
    .route('/agefans', agefans_1.default)
    .route('/movie', movie_1.default)
    .route('/komica', komica_1.default)
    .route('/himawari', himawari_1.default)
    .route('/niconico', niconico_1.default)
    .route('/convert', convert_1.default)
    .route('/bahamut', bahamut_1.default)
    .route('/bilibili', bilibili_1.default)
    .route('/meta-fetcher', meta_fetcher_1.default)
    .route('/my-movie-record', my_movie_record_1.default)
    .route('/anime1', anime1_1.default)
    .route('/line', line_1.default)
    .route('/my-log', my_log_1.default)
    .route('/umamusume', umamusume_1.default)
    .route('/sns', sns_1.default)
    .route('/blog', blog_1.default)
    .route('/web-push', web_push_1.default);
// Apply end middlewares to all routes
app.use('*', ...middlewares_1.endMiddlewares);
exports.default = app;
//# sourceMappingURL=index.js.map