const { check, validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const transporter = require("../utils/email");
const sendVerificationEmail = require("../utils/email");
const crypto = require("crypto");

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
  if (!user.isVerified) {
    return res.status(401).render("auth/login", {
      pageTitle: "login",
      currentPage: "login",
      isLoggedIn: false,
      errors: ["Please verify your email before logging in."],
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
  res.redirect("/homes");
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
  .withMessage("Please enter a valid email address"),
  
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


   const token = Math.floor(100000 + Math.random() * 900000).toString();
 bcrypt.hash(password, 12)
      .then((hashedPassword) => {
        const user = new User({
          firstName,
          lastName,
          email,
          password: hashedPassword,
          userType,
          verificationCode: token,
        });
        return user.save();
      })
      .then(async(user) => {
        const verificationLink = `http://localhost:3000/verify-email?token=${user.verificationCode}&email=${user.email}`;
        await sendVerificationEmail(user.email, user.verificationCode);
        res.render("auth/verify-email", {
          email: user.email,
          code: user.verificationCode,
          pageTitle: "Email Verification"
        });
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
  
exports.verifyEmail = async (req, res, next) => {
  const code = req.body.code || req.query.token;
  const email = req.body.email || req.query.email;

  const user = await User.findOne({ email });

  if (!user) {
   return res.redirect("/signup");
  }
    ;
  if (user.verificationCode !== code) {
    return res.status(400).send("enter a valid code");
  }
  user.isVerified = true;
  user.isLoggedIn = true;
  user.verificationCode = undefined;
  user.verificationCodeExpires = undefined;
  await user.save();
  res.redirect("/login");
}


exports.getVerifyEmail = (req, res, next) => {
  const { token, email } = req.query;
  res.render("auth/verify-email", {
    email,
    token: token,
    pageTitle: "Email Verification"
  });
} 

exports.resendOtp = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).send("User not found");
  }
  if (user.isVerified) {
    return res.status(400).send("Email is already verified");
  }
  const newCode = Math.floor(100000 + Math.random() * 900000).toString();
  user.verificationCode = newCode;
  user.verificationCodeExpires = Date.now() + 30*1000; // 30 seconds expiration

  await user.save();
   await sendVerificationEmail(user.email, newCode);
  res.json({ message: "New OTP sent to your email" });
}


