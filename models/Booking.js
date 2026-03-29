const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  homeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Home",
    required: true
  },
  status: {
    type: String,
    default: "pending" 
  }
});

module.exports = mongoose.model("Booking", bookingSchema);