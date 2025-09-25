import { DeleteRoute } from "./delete";
import { ForgotPasswordRoute } from "./forgotPassword";
import { GoogleAuth } from "./googleAuth";
import { LoginRoute } from "./login";
import { LogOutRoute } from "./logout";
import TelegramAuth from "./telegramAuth"
import { Onboarding } from "./onboarding";
import { RefreshTokenRoute } from "./refresh";
import { SignupRoute } from "./Signup";
import express from "express";

const router = express.Router();

router.use("/delete", DeleteRoute);
router.use("/forgot-password", ForgotPasswordRoute);
router.use("/signin", LoginRoute);
router.use("/logout", LogOutRoute);
router.use("/onboarding", Onboarding);
router.use("/refresh-token", RefreshTokenRoute);
router.use("/signup", SignupRoute);
router.use("/tel", TelegramAuth)

export default router;
