// External Module
const express = require("express");
const authRouter = express.Router();

// Local Module
const authController = require("../controllers/authController");

authRouter.get("/login", authController.getlogin);
authRouter.post("/login",authController.postlogin);
authRouter.post("/logout", authController.postLogout);
authRouter.get("/signup", authController.getsignup);
authRouter.post("/signup", authController.postsignup);
authRouter.get("/verify-email", authController.getVerifyEmail);
authRouter.post("/verify-email", authController.verifyEmail);
authRouter.post("/resend-otp", authController.resendOtp);

module.exports = authRouter;