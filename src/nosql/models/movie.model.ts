import { Schema, Model, Document, model } from 'mongoose';


export interface MovieRatingDocumentDef extends Document {
  id: string;
  year: string;
  ratingId: string;
  title: string;
  country:string;
  runtime:string;
  rating: string;
  dateCreated?: Date;
}

const MovieRating = new Schema({
  id: {
    type: String,
    default: ''
  },
  year: {
    type: String,
    default: ''
  },
  ratingId: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  },
  country: {
    type: String,
    default: ''
  },
  runtime: {
    type: String,
    default: ''
  },
  rating: {
    type: String,
    default: ''
  },
  dateCreated: { 
    type: Date, 
    default: new Date() 
  },
})

export const MovieRatingModel: Model<MovieRatingDocumentDef> = model('movie-rating', MovieRating);