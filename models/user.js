const mongoose = require('mongoose');

const userSchema = mongoose.Schema({

  firstName: {type:String,require : true},
  lastName: {type:String,require : true},
  email: {type:String,require : true, unique: true},
  password: {type:String,require : true},
  userType: {type:String,require : true},
  favourites: [{type:mongoose.Schema.Types.ObjectId, ref: 'Home'}]
});

module.exports = mongoose.model('User', userSchema)