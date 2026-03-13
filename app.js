// Core Module
const path = require('path');
require('dotenv').config();
// External Module
const express = require('express');
const session = require('express-session');
const mongoDbStore = require('connect-mongodb-session')(session);
const multer = require('multer');


 const Url = process.env.MONGODB_URI;

//Local Module
const storeRouter = require("./routes/storeRouter")
const hostRouter = require("./routes/hostRouter")
const authRouter = require("./routes/authRouter")
const rootDir = require("./utils/pathUtil");
const errorsController = require("./controllers/errors");
const { default: mongoose}= require('mongoose');

const app = express();
const store = new mongoDbStore({
  uri: Url,
  collection: 'sessions'
});
app.set('view engine', 'ejs');
app.set('views', 'views');


const rendomString = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);


const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG and PNG files are allowed'), false);
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = rendomString();
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const multerOptions = {
  storage,
  fileFilter
}



app.use(express.urlencoded());
app.use(multer(multerOptions).single('photo'));
app.use(express.static(path.join(rootDir, 'public')));
app.use('/uploads', express.static(path.join(rootDir, 'uploads')));
app.use('/host/uploads', express.static(path.join(rootDir, 'uploads')));

app.use(session({
  secret:'jemish jikadara',
  resave: false,
  saveUninitialized: true,
  store: store
}));

app.use((req, res, next) => {
  req.isLoggedIn = req.session.isLoggedIn;
  next();
});

app.use(storeRouter);
app.use(authRouter);
app.use("/host", (req, res, next) => {
  if (req.isLoggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
});
app.use("/host", hostRouter);

app.use(errorsController.pageNotFound);


const PORT = process.env.PORT;
 mongoose.connect(Url).then(()=>{
  console.log('database connected')
  app.listen(PORT,()=>{
   console.log(`Server running on address http://localhost:${PORT}`);
  })
 }).catch(()=>{
  console.log('err is hear')
 });

