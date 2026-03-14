// External Module
const express = require("express");
const hostRouter = express.Router();
const multer = require('multer');

const {CloudinaryStorage} = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Local Module
const hostController = require("../controllers/hostController");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'store-images',
    allowed_formats: ['jpg', 'jpeg', 'png']
  }
});

const upload = multer({ storage });


hostRouter.get("/add-home", hostController.getAddHome);
hostRouter.post("/add-home",
    upload.single('photo'),
    hostController.postAddHome);
hostRouter.get("/host-home-list", hostController.getHostHomes);
hostRouter.get("/edit-home/:homeId", hostController.getEditHome);
hostRouter.post("/edit-home",
    upload.single('photo'),
    hostController.postEditHome);
hostRouter.post("/delete-home/:homeId", hostController.postDeleteHome);

module.exports = hostRouter;
