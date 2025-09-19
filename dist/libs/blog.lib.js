import { BlogPostViewModel } from '../nosql/models/blog.model';
export async function addViewCount(id) {
    let post = await BlogPostViewModel.findOne({
        id,
    });
    if (!post) {
        post = await BlogPostViewModel.create({
            id,
            viewCount: 1,
        });
        return post.toJSON();
    }
    await BlogPostViewModel.updateOne({ id: post.id, }, {
        $set: {
            viewCount: post.viewCount + 1,
        }
    });
    return getViewCount(post.id);
}
export async function getViewCount(id) {
    let post = await BlogPostViewModel.findOne({
        id,
    });
    if (!post) {
        post = await BlogPostViewModel.create({
            id,
            viewCount: 0,
        });
        return post.toJSON();
    }
    return post.toJSON();
}
