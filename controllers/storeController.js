 
const Home = require("../models/home");
const User = require("../models/user");
const Booking = require("../models/Booking")



exports.getIndex = (req, res, next) => {

  if (req.session.user) {
    return res.redirect("/homes");
  }

  res.render("store/index", {
    pageTitle: "airbnb Home",
    currentPage: "index",
    isLoggedIn: req.isLoggedIn,
    user: req.session.user
  });
};


exports.getHomes = (req, res, next) => {
  Home.find().then((registeredHomes) => {
    res.render("store/home-list", {
      registeredHomes: registeredHomes,
      pageTitle: "Homes List",
      currentPage: "Home",
      isLoggedIn: req.isLoggedIn, 
      user: req.session.user
    });
  });
};

// get all te booking of a user
exports.getAllBookings = async (req, res) => {
  try {
    const userId = req.session.user._id;

    const bookings = await Booking.find({ userId }).populate("homeId");

    res.render("store/bookings-list", {
      pageTitle: "My Bookings",
      currentPage: "booking",
      bookings: bookings,
      isLoggedIn: req.isLoggedIn,
      user: req.session.user
    });

  } catch (err) {
    console.log(err);
    res.send("Error loading bookings");
  }
};

//handel a post request to add a home to booking
exports.postAddToBooking = async (req, res) => {
  try {
    const homeId = req.body.homeId;
    const userId = req.session.user._id;

    const exist = await Booking.findOne({ homeId, userId });

    if (exist) {
      return res.redirect("/bookings");
    }

    await Booking.create({ homeId, userId });

    res.redirect("/bookings");

  } catch (err) {
    console.log(err);
  }
};


exports.postRemoveFromBooking = async (req, res) => {
  try {
    const homeId = req.params.homeId;
    const userId = req.session.user._id;

    await Booking.deleteOne({ homeId, userId });

    res.redirect("/bookings");

  } catch (err) {
    console.log(err);
  }
};
exports.postConfirmBooking = async (req, res) => {
  try {
    const homeId = req.params.homeId;
    const userId = req.session.user._id;

    // status update
    await Booking.updateOne(
      { homeId, userId },
      { status: "confirmed" }
    );

    // 👉 PAYMENT PAGE redirect
    res.redirect("/payment/" + homeId);

  } catch (err) {
    console.log(err);
  }
};


exports.getBookings = async(req, res, next) => {
   try {
    const home = await Home.findById(req.params.id);

    console.log(home)

    if (!home) {
      return res.send("Home not found");
    }

    res.render("store/bookings", {
      pageTitle: "Book Home",
      currentPage: "booking",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
      home: home   
    });

  } catch (err) {
    console.log(err);
    res.send("Error loading booking page");
  }
};

exports.getFavouriteList = async (req, res, next) => {

  const userId = req.session.userId;
 const user = await User.findById(userId).populate('favourites');
      res.render("store/favourite-list", {
        favouriteHomes: user.favourites,
        pageTitle: "My Favourites",
        currentPage: "favourites",
        isLoggedIn: req.isLoggedIn,
        user: req.session.user
      });
    };

exports.postAddToFavourite = async(req, res, next) => {
          const homeId = req.body.id;
          const userId = req.session.userId;
          const user = await User.findById(userId);
          if (!user.favourites.includes(homeId)) {
                user.favourites.push(homeId);
                await user.save();
          }
          res.redirect("/favourites");
};  

exports.postRemoveFromFavourite = async(req, res, next) => {
  const homeId = req.params.homeId;
  const userId = req.session.userId;
  const user =  await User.findById(userId);
  if (user.favourites.includes(homeId)) {
    user.favourites = user.favourites.filter(fav => fav  != homeId);
    await user.save();
  }
    res.redirect("/favourites");
};

exports.getHomeDetails = (req, res, next) => {
  const homeId = req.params.homeId;
  Home.findById(homeId).then((home) => {
    if (!home) {
      console.log("Home not found");
      res.redirect("/homes");
    } else {
      res.render("store/home-detail", {
        home: home,
        pageTitle: "Home Detail",
        currentPage: "Home",
        isLoggedIn: req.isLoggedIn,
        user: req.session.user
      });
    }
  });
};


exports.getpayment = async(req,res,next)=>{
  const homeId= req.params.id;
  const home = await Home.findById(homeId);
  res.render("store/payment",{
    home:home
  })
}
