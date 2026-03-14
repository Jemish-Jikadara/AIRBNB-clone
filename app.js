const path = require("path");
require("dotenv").config();

const express = require("express");
const session = require("express-session");
const mongoDbStore = require("connect-mongodb-session")(session);
const mongoose = require("mongoose");

const storeRouter = require("./routes/storeRouter");
const hostRouter = require("./routes/hostRouter");
const authRouter = require("./routes/authRouter");

const rootDir = require("./utils/pathUtil");
const errorsController = require("./controllers/errors");

const Url = process.env.MONGODB_URI;

const app = express();

const store = new mongoDbStore({
  uri: Url,
  collection: "sessions"
});

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(rootDir, "public")));

app.use(
  session({
    secret: "jemish jikadara",
    resave: false,
    saveUninitialized: false,
    store: store
  })
);

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

app.use((err,req,res,next)=>{
  console.log("real error",err);
  res.status(500).send(err.massage);
})
app.use(errorsController.pageNotFound);

const PORT = process.env.PORT || 3000;

mongoose
  .connect(Url)
  .then(() => {
    console.log("Database connected");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.log(err));