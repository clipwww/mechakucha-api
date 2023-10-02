"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getViewCount = exports.addViewCount = void 0;
const blog_model_1 = require("../nosql/models/blog.model");
async function addViewCount(id) {
    let post = await blog_model_1.BlogPostViewModel.findOne({
        id,
    });
    if (!post) {
        post = await blog_model_1.BlogPostViewModel.create({
            id,
            viewCount: 1,
        });
        return post.toJSON();
    }
    await blog_model_1.BlogPostViewModel.updateOne({ id: post.id, }, {
        $set: {
            viewCount: post.viewCount + 1,
        }
    });
    return getViewCount(post.id);
}
exports.addViewCount = addViewCount;
async function getViewCount(id) {
    let post = await blog_model_1.BlogPostViewModel.findOne({
        id,
    });
    if (!post) {
        post = await blog_model_1.BlogPostViewModel.create({
            id,
            viewCount: 0,
        });
        return post.toJSON();
    }
    return post.toJSON();
}
exports.getViewCount = getViewCount;
//# sourceMappingURL=blog.lib.js.map