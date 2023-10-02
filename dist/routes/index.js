"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
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
const router = (0, express_1.Router)();
router
    .use('/notifications', notifications_1.default)
    .use('/agefans', agefans_1.default, ...middlewares_1.endMiddlewares)
    .use('/movie', movie_1.default, ...middlewares_1.endMiddlewares)
    .use('/komica', komica_1.default, ...middlewares_1.endMiddlewares)
    .use('/himawari', himawari_1.default, ...middlewares_1.endMiddlewares)
    .use('/niconico', niconico_1.default, ...middlewares_1.endMiddlewares)
    .use('/convert', convert_1.default, ...middlewares_1.endMiddlewares)
    .use('/bahamut', bahamut_1.default, ...middlewares_1.endMiddlewares)
    .use('/bilibili', bilibili_1.default, ...middlewares_1.endMiddlewares)
    .use('/meta-fetcher', meta_fetcher_1.default, ...middlewares_1.endMiddlewares)
    .use('/my-movie-record', my_movie_record_1.default, ...middlewares_1.endMiddlewares)
    .use('/anime1', anime1_1.default, ...middlewares_1.endMiddlewares)
    .use('/line', line_1.default, ...middlewares_1.endMiddlewares)
    .use('/my-log', my_log_1.default, ...middlewares_1.endMiddlewares)
    .use('/umamusume', umamusume_1.default, ...middlewares_1.endMiddlewares)
    .use('/sns', sns_1.default, ...middlewares_1.endMiddlewares)
    .use('/blog', blog_1.default, ...middlewares_1.endMiddlewares)
    .use('/web-push', web_push_1.default, ...middlewares_1.endMiddlewares);
exports.default = router;
//# sourceMappingURL=index.js.map