import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import { body, validationResult } from "express-validator";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";
import passport from "../config/passport.js";

const prisma = new PrismaClient();
const validateSignUp = [
  body("email")
    .toLowerCase()
    .trim()
    .custom(async (value) => {
      const users = await prisma.user.findMany();
      const emailIds = users.map((user) => user.email.toLowerCase());
      if (emailIds.includes(value)) {
        throw new Error("Email already exists! Try a different one.");
      }
    }),
  body("confirmPassword")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("The passwords do not match"),
];

const userLoginGet = (req, res) => {
  if (req.user) redirect("/");
  else res.render("login", { user: req.user });
};
const userSignUpGet = (req, res) => res.render("sign-up");
const userLogoutGet = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
};


const userLoginPost = (req, res) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
  })
}

const userSignUpPost = [
  validateSignUp,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("sign-up", {
        errors: errors.array(),
      });
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = { ...req.body, password: hashedPassword };
    await prisma.user.create({ data: newUser });
    res.redirect("/login");
  }),
];

export default {
  userLoginGet,
  userSignUpGet,
  userLogoutGet,
  userLoginPost,
  userSignUpPost,
};
