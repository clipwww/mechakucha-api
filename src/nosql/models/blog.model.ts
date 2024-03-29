import { Schema, Model, Document, model } from 'mongoose';

import { idGenerator } from '../../utilities';


const BlogPostView = new Schema({
  id: {
    type: String,
    default: idGenerator.generateV4UUID(),
  },
  viewCount: {
    type: Number,
    default: 1
  },
})

export interface BlogPostViewDocumentDef extends Document {
  id: string;
  viewCount: number;
}


export const BlogPostViewModel = model('blog-post-view', BlogPostView);