const { check, validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

exports.getlogin = (req, res, next) => {
  res.render("auth/login", {
    pageTitle: "login",
    currentPage: "login",
    isLoggedIn: false, 
    errors: [],
    oldInput: { email: "", password: "" },
    user: {},
  });
};

exports.postlogin = async(req, res, next) => {

  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).render("auth/login", {
      pageTitle: "login",
      currentPage: "login",
      isLoggedIn: false,
      errors: ["User dose not found...."],
      oldInput: { email, password },
      user: {},
    });
  }
  const doMatch = await bcrypt.compare(password, user.password);

  if (!doMatch) {
    return res.status(401).render("auth/login", {
      pageTitle: "login",
      currentPage: "login",
      isLoggedIn: false,
      errors: ["Invalid password...."],
      oldInput: { email, password },
      user: {},
    });
  }

  req.session.isLoggedIn = true;
  req.session.user = user;
  req.session.userId = user._id;
  req.session.save((err) => {
    if (err) {
      console.error("Session save error:", err);
    }
  res.redirect("/");
  });

}

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
    res.redirect("/login");
    });
  
}

exports.getsignup = (req, res, next) => {
  res.render("auth/signup", {
    pageTitle: "Signup",
    currentPage: "signup",
    isLoggedIn: false,
    errors:[],
    oldInput:{ firstName: "", lastName: "", email: "", password: "", userType: "" },
    user: {},
  });
};
exports.postsignup = [

  check("firstName")
  .isLength({ min: 2 })
  .withMessage("first name must be at least 2 characters long"),

  check("lastName")
  .isLength({ min: 2 })
  .withMessage("last name must be at least 2 characters long")
  .matches(/^[A-Za-z]*$/)
  .withMessage("last name must contain only letters"),

  check("email")
  .isEmail()
  .withMessage("Please enter a valid email address")
  .normalizeEmail(),

  check("password")
  .isLength({min: 8})
  .withMessage("Password should be atleast 8 characters long")
  .matches(/[A-Z]/)
  .withMessage("Password should contain atleast one uppercase letter")
  .matches(/[a-z]/)
  .withMessage("Password should contain atleast one lowercase letter")
  .matches(/[0-9]/)
  .withMessage("Password should contain atleast one number")
  .matches(/[!@&]/)
  .withMessage("Password should contain atleast one special character")
  .trim(),

  check("conformPassword")
  .trim()
  .custom((value, {req}) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),

  check("userType")
  .notEmpty()
  .withMessage("User type is required")
  .isIn(["host", "guest"])
  .withMessage("User type must be either host or guest"),

  check("terms")
  .notEmpty()
  .withMessage("Please accept the terms and conditions")
  .custom((value, {req}) => {
    if (value !== "on") {
      throw new Error("Please accept the terms and conditions");
    }
    return true;
  }),

  // now ready to use a handler function
  (req, res, next) => {
    const { firstName, lastName, email, password, userType } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("auth/signup", {
        pageTitle: "Signup",
        currentPage: "signup",
        isLoggedIn: true,
        errors: errors.array().map((err) => err.msg),
        oldInput: { firstName, lastName, email, password, userType },
        user: {},
      });
    }

 bcrypt.hash(password, 12)
      .then((hashedPassword) => {
        const user = new User({
          firstName,
          lastName,
          email,
          password: hashedPassword,
          userType
        });
        return user.save();
      })
      .then(() => {
        res.redirect("/login");
      })
      .catch((err) => {
        console.error("Error saving user:", err);
        res.status(500).render("auth/signup", {
        pageTitle: "Signup",
        currentPage: "signup",
        isLoggedIn: false,
        errors: [err.message],
        oldInput: { firstName, lastName, email, password, userType },
        user:{}
        });
      });
  }
];
  


