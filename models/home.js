const mongoose = require('mongoose');

const homeSchema = mongoose.Schema({

  houseName:{type:String, required:true},
  price:{type:String, required:true},
  location:{type:String, required:true},
  rating:{type:String, required:true},
  photo:String,
  description:String,
  owner:{
    type: mongoose.Schema.Types.ObjectId,
    ref:'User',
    required:true
  }
});

module.exports = mongoose.model('Home', homeSchema)