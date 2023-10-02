"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogPostViewModel = void 0;
const mongoose_1 = require("mongoose");
const utilities_1 = require("../../utilities");
const BlogPostView = new mongoose_1.Schema({
    id: {
        type: String,
        default: utilities_1.idGenerator.generateV4UUID(),
    },
    viewCount: {
        type: Number,
        default: 1
    },
});
exports.BlogPostViewModel = (0, mongoose_1.model)('blog-post-view', BlogPostView);
//# sourceMappingURL=blog.model.js.map