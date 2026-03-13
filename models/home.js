const mongoose = require('mongoose');

const homeSchema = mongoose.Schema({

  houseName: {type:String,require : true},
  price:{type:String,require : true},
  location:{type:String,require : true},
  rating:{type:String,require : true},
  photo:String,
  description:String,
});

// homeSchema.pre('findOneAndDelete', async function(next) {
//   console.log('Came to pre hook while deleting a home');
//   const homeId = this.getQuery()._id;
//   await favourite.deleteMany({houseId: homeId});
//   console.log(next);
// });

module.exports = mongoose.model('Home', homeSchema)