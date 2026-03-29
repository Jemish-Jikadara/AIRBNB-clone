// External Module
const express = require("express");
const storeRouter = express.Router();

// Local Module
const storeController = require("../controllers/storeController");

storeRouter.get("/", storeController.getIndex);
storeRouter.get("/homes", storeController.getHomes);
// storeRouter.get("/bookings/:id", storeController.getBookings);
storeRouter.get("/favourites", storeController.getFavouriteList);
storeRouter.get("/homes/:homeId", storeController.getHomeDetails);
storeRouter.post("/favourites", storeController.postAddToFavourite);
storeRouter.post("/favourites/delete/:homeId", storeController.postRemoveFromFavourite);
storeRouter.get("/payment/:id", storeController.getpayment);
// Add to booking
storeRouter.post("/bookings", storeController.postAddToBooking);

// Remove from booking
storeRouter.post("/bookings/delete/:homeId", storeController.postRemoveFromBooking);

// All bookings page
storeRouter.get("/bookings", storeController.getAllBookings);

//All Confirm booking 
storeRouter.post("/bookings/confirm/:homeId", storeController.postConfirmBooking);

module.exports = storeRouter;
