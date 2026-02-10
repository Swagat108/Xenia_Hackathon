import { Router } from "express";
import {registerUser,login, logout, verifyEmail, refreshAccessToken, forgotPassword, resetForgotPassword, getCurrentUser, changeCurrentPassword, resendEmailVerification } from "../controllers/auth.controllers.js";

import { validate } from "../middleware/validator.middleware.js";
import { userRegisterValidations , loginValidations, forgotPasswordValidator, resetForgotPasswordValidator, changeCurrentPasswordValidator } from "../validators/index.js";
import { verifyJWT } from "../middleware/auth.middleware.js";


const router = Router();

//unsecured routes
router.route("/register").post(userRegisterValidations(),validate,registerUser);
router.route("/login").post(loginValidations(),validate,login);
router.route("/verify-email/:verificationToken").get(verifyEmail);

router.route("/refresh-token").post(refreshAccessToken);

router.route("/forgot-password").post(forgotPasswordValidator(),validate,forgotPassword);
router.route("/reset-password/:resetToken").post(resetForgotPasswordValidator(),validate,resetForgotPassword);

//secured routes
router.route("/logout").post(verifyJWT,logout)
router.route("/current-user").get(verifyJWT,getCurrentUser);
router.route("/change-password").post(verifyJWT,changeCurrentPasswordValidator(),validate,changeCurrentPassword);
router.route("/resend-email-verification").post(verifyJWT,resendEmailVerification);
export default router;

