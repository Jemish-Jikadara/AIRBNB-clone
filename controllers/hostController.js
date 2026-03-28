const Home = require("../models/home");
const fs = require('fs');
const cludinary = require('cloudinary').v2;

cludinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
exports.getAddHome = (req, res, next) => {
  res.render("host/edit-home", {
    pageTitle: "Add Home to airbnb",
    currentPage: "addHome",
    editing: false,
    isLoggedIn: req.isLoggedIn,
      user: req.session.user
  });
};

exports.getHostHomes = (req, res, next) => {
  Home.find({owner: req.session.user._id}).then((registeredHomes) => {
    res.render("host/host-home-list", {
      registeredHomes: registeredHomes,
      pageTitle: "Host Homes List",
      currentPage: "host-homes",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user
    });
  });
};

exports.getEditHome = (req, res, next) => {
  const homeId = req.params.homeId;
  const editing = req.query.editing === "true";

  Home.findOne({ _id: homeId, owner: req.session.user._id }).then((home) => {
    if (!home) {
      console.log("Home not found for editing.");
      return res.redirect("/host/host-home-list");
    }
    res.render("host/edit-home", {
      home: home,
      pageTitle: "Edit your Home",
      currentPage: "host-homes",
      editing: editing,
      isLoggedIn: req.isLoggedIn,
      user: req.session.user
    });
  });
};



exports.postAddHome = (req, res, next) => {
  const { houseName, price, location, rating, description } =
    req.body;
    console.log("Received data ", req.body);
    console.log("Received file ", req.file);

    const ratingNumber = Number(rating);

    if (isNaN(ratingNumber)){
      return res.status(400).send("invalid rating formet")
    }
    if(ratingNumber > 5 || ratingNumber < 0 ){
      return res.status(400).send(" Rating must be between 0 and 5")
    }
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

     const photo = req.file.path; // cludinary returns the URL in the path property
     
  const home = new Home({
    houseName,
    price,
    location,
    rating,
    photo,
    description,
    owner: req.session.user._id
  });
  home.save().then(() => {
    console.log("Home Saved successfully");
    res.redirect("/host/host-home-list");
  });

};

exports.postEditHome = (req, res, next) => {
  const { id, houseName, price, location, rating, description } =
    req.body;
  Home.findById(id).then((home) => {
    home.houseName = houseName;
    home.price = price;
    home.location = location;
    home.rating = rating;
    home.description = description;

      if (req.file) {
        home.photo = req.file.path;
      }
    home.save().then(() => {
    res.redirect("/host/host-home-list");
    });
}).catch((error) => {
    console.log("Error while updating ", error);
  });
};

exports.postDeleteHome = async(req, res, next) => {
  const homeId = req.params.homeId;
  try {
    const home = await Home.findById(homeId);
    if (!home) {
      console.log("Home not found for deletion.");
      return res.redirect("/host/host-home-list");
    }
    
    // Extract public ID from the photo URL
    const photoUrl = home.photo;
    const publicId = photoUrl.split('/').slice(-2).join('/').split('.')[0]; // Assuming the URL format is consistent with Cloudinary's response
    
    // Delete the image from Cloudinary
    await cludinary.uploader.destroy(publicId);
    console.log("public id: ", publicId);
    
    // Delete the home from the database
    await Home.findOneAndDelete({ _id: homeId, owner: req.session.user._id });
    
    console.log("Home and associated image deleted successfully.");
    res.redirect("/host/host-home-list");
  } catch (error) {
    console.log("Error while deleting home: ", error);
    res.status(500).send("An error occurred while deleting the home.");
  }
};