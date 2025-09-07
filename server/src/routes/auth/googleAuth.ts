import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import axios from "axios";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import supabase from "../../config/supabaseClient"; // anon client
dotenv.config();

const router = Router();

// Admin client (service role key)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// JWT secrets
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;

// URLs
const BACKEND_URL = process.env.BACKEND_URL!;
const FRONTEND_URL = process.env.FRONTEND_URL!;
const GOOGLE_CLIENT_ID = process.env.SIGNIN_WITH_GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.SIGNIN_WITH_GOOGLE_CLIENT_SECRET!;

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none" as const,
};

router.get("/login/google", (req: Request, res: Response) => {
  const callbackUrl = `${BACKEND_URL}/auth/google/callback`;
  const googleAuthUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `response_type=code&` +
    `client_id=${GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(callbackUrl)}&` +
    `scope=openid%20email%20profile`;

  res.redirect(googleAuthUrl);
});

router.get("/google/callback", async (req: Request, res: Response) => {
  const code = req.query.code as string;
  if (!code) return res.status(400).json({ error: "Missing code" });

  try {
    // Step 1 — Exchange code for tokens
    const params = new URLSearchParams();
    params.append("code", code);
    params.append("client_id", GOOGLE_CLIENT_ID);
    params.append("client_secret", GOOGLE_CLIENT_SECRET);
    params.append("redirect_uri", `${BACKEND_URL}/auth/google/callback`);
    params.append("grant_type", "authorization_code");

    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      params.toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token } = tokenResponse.data;
    if (!access_token) throw new Error("No access token from Google");

    // Step 2 — Get Google user profile
    const { data: googleUser } = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    console.log("✅ Google user:", googleUser);

    // Step 3 — Ensure user exists in Supabase auth.users
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    let supabaseUser = existingUsers?.users.find(u => u.email === googleUser.email);

    if (!supabaseUser) {
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: googleUser.email,
        email_confirm: true,
      });
      if (createError) throw createError;
      supabaseUser = newUser.user;
    }

    // Step 4 — Upsert into profiles
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: supabaseUser.id,     // UUID from auth.users
        google_id: googleUser.id,
        email: googleUser.email,
        full_name: googleUser.name,
        avatar_url: googleUser.picture,
        plan: "Free"
      })
      .select("*")
      .single();

    if (profileError) throw profileError;
    console.log("✅ Profile synced:", profile);

    // Step 5 — Create our own JWT tokens
    const ourAccessToken = jwt.sign(
      { userId: supabaseUser.id, email: googleUser.email },
      ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );
    const ourRefreshToken = jwt.sign(
      { userId: supabaseUser.id, email: googleUser.email },
      REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    // Step 6 — Set httpOnly cookies and redirect
    res.cookie("accessToken", ourAccessToken, { ...cookieOptions, maxAge: 60 * 60 * 1000 });
    res.cookie("refreshToken", ourRefreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

    console.log("✅ Cookies set successfully");
    return res.redirect(`${FRONTEND_URL}/dashboard`);
  } catch (err: any) {
    console.error("❌ OAuth callback failed:", err.response?.data || err.message);
    return res.status(500).json({ error: "OAuth callback failed" });
  }
});

export { router as GoogleAuth };
