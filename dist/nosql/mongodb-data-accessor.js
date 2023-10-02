"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectMongoDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
mongoose_1.default.set('strictQuery', true);
function connectMongoDB() {
    console.log("MongoDb init");
    // let db: mongoose.Connection
    mongoose_1.default.connect(`${process.env.MONGODB_URI}?retryWrites=true&w=majority`)
        .then(() => {
        console.log('mongodb connected');
    })
        .catch(err => {
        console.log('connection error: ', err);
    });
    // db = mongoose.connection;
}
exports.connectMongoDB = connectMongoDB;
//# sourceMappingURL=mongodb-data-accessor.js.map