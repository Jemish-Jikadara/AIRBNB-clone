const mongoose = require('mongoose');

const homeSchema = mongoose.Schema({

  houseName:String,
  price:String,
  location:String,
  rating:String,
  photo:String,
  description:String,
});

module.exports = mongoose.model('Home', homeSchema)