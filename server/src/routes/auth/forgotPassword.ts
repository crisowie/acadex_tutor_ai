import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import supabase from '../../config/supabaseClient';

dotenv.config();
const router = express.Router();

// 🔐 Forgot Password Endpoint
router.post("/", async (req: Request, res: Response) => {
  const { email } = req.body;

  // ✅ Validate Email
  if (!email) {
    return res.status(400).json({ message: "Please specify an email address" });
  }

  try {
    // ✅ Send Reset Password Email via Supabase Auth
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`, // This should match what you configured in Supabase
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(200).json({
      message: "Password reset email sent. Please check your inbox.",
      data,
    });

  } catch (err) {
    console.error("Reset Password Error:", err);
    return res.status(500).json({ message: "Something went wrong. Please try again later." });
  }
});



export { router as ForgotPasswordRoute };
