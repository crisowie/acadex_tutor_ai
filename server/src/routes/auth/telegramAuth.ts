import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import supabase from "../../config/supabaseClient";
import { verifyTelegramInitData } from "../../config/verifyTelegram";
dotenv.config();

const router = express.Router();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET || !TELEGRAM_BOT_TOKEN) {
  throw new Error("Missing required env vars (ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, TELEGRAM_BOT_TOKEN)");
}

router.post("/", async (req: Request, res: Response) => {
  try {
    const { initData } = req.body as { initData?: string };
    if (!initData) return res.status(400).json({ error: "No initData" });

    const verified = verifyTelegramInitData(initData, TELEGRAM_BOT_TOKEN);
    if (!verified) return res.status(401).json({ error: "Invalid Telegram data" });

    const telegramUser = verified.user;
    if (!telegramUser) return res.status(400).json({ error: "No Telegram user data" });

    const telegramId = telegramUser.id;
    const email = `${telegramId}@telegram.acadex`;
    const full_name = `${telegramUser.first_name || ""} ${telegramUser.last_name || ""}`.trim();

    // Ensure profile exists
    let { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("telegram_id", telegramId)
      .single();

    if (!profile) {
      const { data: newProfile, error: insertError } = await supabase
        .from("profiles")
        .insert({
          telegram_id: telegramId,
          username: telegramUser.username || "",
          full_name: full_name || "Telegram User",
          avatar: telegramUser.photo_url || "",
          email,
        })
        .select("*")
        .single();

      if (insertError) {
        console.error("Supabase insert error:", insertError);
        return res.status(500).json({ error: "Failed to create Telegram profile" });
      }
      profile = newProfile;
    }

    // Generate tokens
    const payload = { userId: profile.id, email: profile.email, telegramId: profile.telegram_id };
    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
    const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: "1d" });

    // Set cookies
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 1000 * 60 * 60,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24,
    });

    return res.status(200).json({
      message: "Telegram login successful",
      user: profile, // matches your frontend AuthContext
    });
  } catch (err) {
    console.error("Telegram login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
