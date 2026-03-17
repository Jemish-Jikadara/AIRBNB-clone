const mongoose = require('mongoose');

const userSchema = mongoose.Schema({

  firstName: {type:String,require : true},
  lastName: {type:String,require : true},
  email: {type:String,require : true, unique: true},
  isLoggedIn: {type:Boolean, default:false},
  isVerified: {type:Boolean, default:false},
  verificationCode: String,
  verificationCodeExpires: {
    type: Date,
    default: () => Date.now() + 5*60*1000 // 
  },
  password: {type:String,require : true},
  userType: {type:String,require : true},

  favourites: [{type:mongoose.Schema.Types.ObjectId, ref: 'Home'}]
});

module.exports = mongoose.model('User', userSchema)