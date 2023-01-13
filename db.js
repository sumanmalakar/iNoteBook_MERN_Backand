const mongoose = require('mongoose');

const mongoURI = "mongodb+srv://suman:suman8896@cluster0.dkbfbbo.mongodb.net/?retryWrites=true&w=majority";


const connectToMongo = () => {
  mongoose.connect(mongoURI, () => {
    console.log("Connected to Mongo DB Successfully!");
  })
}

module.exports = connectToMongo;