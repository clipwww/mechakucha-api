import  mongoose from 'mongoose';

mongoose.set('strictQuery', true)

export function connectMongoDB() {
  console.log("MongoDb init");
  
  // let db: mongoose.Connection

  mongoose.connect(`${process.env.MONGODB_URI}?retryWrites=true&w=majority`)
  .then(() => {
    console.log('mongodb connected');
  })
  .catch(err => {
    console.log('connection error: ', err);
  });
  

  // db = mongoose.connection;
 
}
