import { Schema, Model, Document, model } from 'mongoose';

import { idGenerator } from '../../utilities';

export interface MovieRatingDocumentDef extends Document {
  id?: string;
  no: string;
  officialDoc: string;
  year: string;
  title: string;
  country:string;
  runtime:string;
  rating: string;
  dateCreated?: Date;
}

const MovieRating = new Schema({
  id: {
    type: String,
    default: idGenerator.generateV4UUID(),
  },
  no: {
    type: String,
    default: ''
  },
  officialDoc: {
    type: String,
    default: ''
  },
  year: {
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

export const MovieRatingModel = model('movie-rating', MovieRating);