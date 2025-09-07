import express, { Request, Response } from "express";

const router = express.Router();

router.post("/logout", async (req: Request, res: Response) => {
  // Clear cookies only
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  return res.status(200).json({ message: "Logged out successfully" });
});

export { router as LogOutRoute };
