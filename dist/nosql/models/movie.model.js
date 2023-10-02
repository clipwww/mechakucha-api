"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovieRatingModel = void 0;
const mongoose_1 = require("mongoose");
const utilities_1 = require("../../utilities");
const MovieRating = new mongoose_1.Schema({
    id: {
        type: String,
        default: utilities_1.idGenerator.generateV4UUID(),
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
});
exports.MovieRatingModel = (0, mongoose_1.model)('movie-rating', MovieRating);
//# sourceMappingURL=movie.model.js.map