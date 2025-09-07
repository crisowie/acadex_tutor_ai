import express, { Request, Response } from 'express';
import supabase from '../../config/supabaseClient';
import { Auth } from '../../types';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;

router.post("/signin", async (req: Request, res: Response) => {
  const { email, password } = req.body as Auth;

  if (!email || !password) {
    return res.status(400).json({ error: "Please provide all details" });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      return res.status(400).json({ message: "Login failed", error: error?.message || 'Unknown error' });
    }

    const user = data.user;

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      ACCESS_TOKEN_SECRET,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, email: user.email },
      REFRESH_TOKEN_SECRET,
      { expiresIn: '1d' }
    );

    // Set cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24 ,
    });

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();


    if (profileError) {
      console.error("Profile fetch error:", profileError.message);
    }

    return res.status(200).json({
      message: 'Logged in successfully',
      user: profile
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as LoginRoute };
