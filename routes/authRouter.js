import { Router } from "express";
import authController from "../controllers/authController.js";
const authRouter = Router();

authRouter.get("/sign-up", authController.userSignUpGet);
authRouter.get("/login", authController.userLoginGet);
authRouter.get("/logout", authController.userLogoutGet);

authRouter.post("/sign-up", authController.userSignUpPost);
authRouter.post("/login", authController.userLoginPost);

export default authRouter;
