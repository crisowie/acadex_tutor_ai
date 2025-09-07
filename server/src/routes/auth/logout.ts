import express, { Request, Response } from "express";

const router = express.Router();

router.post("/logout", async (req: Request, res: Response) => {
  // Clear cookies only
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  return res.status(200).json({ message: "Logged out successfully" });
});

export { router as LogOutRoute };
