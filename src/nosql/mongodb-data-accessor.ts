import * as mongoose from 'mongoose';


export function connectMongoDB() {
  let db: mongoose.Connection

  mongoose.connect(`${process.env.MONGODB_URI}?poolSize=100`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  db = mongoose.connection;
  bindEvents();
  console.log("MongoDb init");

  function bindEvents() {
    db.once('open', () => {
      console.log('mongodb connected');
    });

    db.on('error', (err) => {
      console.log('connection error: ', err);
    })
  }
}
