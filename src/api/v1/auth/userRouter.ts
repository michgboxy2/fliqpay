import express from "express";
import { signIn, signUp, loggedOnUser } from "./usercontroller";
import { currentUser } from "../middlewares/decodeToken";

import { body } from "express-validator";
import { validateRequest } from "../middlewares/validate-request";
const router = express.Router();

router
  .route("/signin")
  .post(
    [
      body("email").isEmail().withMessage("Email must be valid"),
      body("password")
        .trim()
        .notEmpty()
        .withMessage("You must supply a password"),
    ],
    validateRequest,
    signIn
  );

router
  .route("/signup")
  .post(
    [
      body("email").isEmail().withMessage("Email must be valid"),
      body("password")
        .trim()
        .isLength({ min: 4, max: 20 })
        .withMessage("Password must be between 4 and 20 characters"),
      body("role")
        .trim()
        .notEmpty()
        .withMessage(
          "you must supply role type, where you're an admin, support or a normal user"
        ),
    ],
    validateRequest,
    signUp
  );

router.route("/currentuser").get(currentUser, loggedOnUser);

export { router as userRouter };
